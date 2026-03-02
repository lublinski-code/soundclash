// ─── Spotify Web Playback SDK Wrapper (Singleton) ───
//
// Stop-protection layers:
//   1. JS elapsed-time timer (recursive setTimeout, fires at startTime + durationMs)
//   2. Backup hard setTimeout (fires at startTime + durationMs + 150ms)
//   3. Watchdog setInterval (position-based backup, every 200ms)
//   4. player_state_changed listener (event-driven: catches late-arriving play commands)
//   5. Post-playTrack race guard (re-pauses if snippet already ended when API resolved)

import { getAccessToken } from "./auth";
import { playTrack, pausePlayback } from "./api";

let player: Spotify.Player | null = null;
let deviceId: string | null = null;
let snippetEnded = false;
let isConnecting = false;
let snippetSessionId = 0;
let watchdogInterval: ReturnType<typeof setInterval> | null = null;
let activeStateListener: ((state: Spotify.PlaybackState) => void) | null = null;

const DEFAULT_START_OFFSET_MS = 2500;

type PlayerReadyCallback = (id: string) => void;
type PlayerErrorCallback = (error: string) => void;

export function isPlayerConnected(): boolean {
  return player !== null && deviceId !== null;
}

export function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) {
      const check = setInterval(() => {
        if (window.Spotify) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("Spotify SDK load timeout"));
      }, 10000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Spotify SDK"));

    document.body.appendChild(script);
  });
}

export async function initPlayer(
  onReady?: PlayerReadyCallback,
  onError?: PlayerErrorCallback
): Promise<void> {
  if (isPlayerConnected()) {
    console.log("[Player] Already connected, device:", deviceId);
    onReady?.(deviceId!);
    return;
  }

  if (isConnecting) {
    console.log("[Player] Already connecting, skipping duplicate init");
    return;
  }

  isConnecting = true;

  if (player) {
    console.log("[Player] Disconnecting stale player...");
    try { player.disconnect(); } catch { /* ignore */ }
    player = null;
    deviceId = null;
  }

  console.log("[Player] Loading Spotify SDK...");

  try {
    await loadSpotifySDK();
    console.log("[Player] SDK loaded");
  } catch (err) {
    console.error("[Player] Failed to load SDK:", err);
    isConnecting = false;
    onError?.("Failed to load Spotify SDK");
    return;
  }

  const token = await getAccessToken();
  if (!token) {
    console.error("[Player] No access token");
    isConnecting = false;
    onError?.("No access token available");
    return;
  }

  console.log("[Player] Creating player instance...");

  player = new window.Spotify.Player({
    name: "SoundClash Game",
    getOAuthToken: async (cb) => {
      const t = await getAccessToken();
      cb(t ?? "");
    },
    volume: 0.8,
  });

  player.addListener("ready", async ({ device_id }) => {
    console.log("[Player] Ready, device ID:", device_id);
    deviceId = device_id;
    isConnecting = false;

    try {
      await transferPlayback(device_id);
      console.log("[Player] Playback transferred");
    } catch (err) {
      console.warn("[Player] Transfer playback failed (non-critical):", err);
    }

    onReady?.(device_id);
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.warn("[Player] Device not ready:", device_id);
    deviceId = null;
    isConnecting = false;
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error("[Player] Init error:", message);
    isConnecting = false;
    onError?.(`Init error: ${message}`);
  });

  player.addListener("authentication_error", ({ message }) => {
    console.error("[Player] Auth error:", message);
    isConnecting = false;
    onError?.(`Auth error: ${message}`);
  });

  player.addListener("account_error", ({ message }) => {
    console.error("[Player] Account error:", message);
    isConnecting = false;
    onError?.(`Account error (Premium required): ${message}`);
  });

  player.addListener("playback_error", ({ message }) => {
    // "Cannot perform operation; no list was loaded." is benign — SDK had no context yet.
    // We suppress it to avoid confusing console noise.
    if (message?.includes("no list was loaded")) {
      console.log("[Player] SDK has no context yet (benign), relying on REST pause.");
      return;
    }
    console.error("[Player] Playback error:", message);
  });

  console.log("[Player] Connecting...");
  const success = await player.connect();

  if (!success) {
    console.error("[Player] connect() returned false");
    isConnecting = false;
    player = null;
    onError?.("Failed to connect to Spotify. Please refresh and try again.");
  }
}

async function transferPlayback(targetDeviceId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;

  await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_ids: [targetDeviceId], play: false }),
  });
}

/**
 * Force-stop playback.
 *
 * Sends REST API pause first (always works, even before SDK loads a context),
 * then SDK pause only if the SDK already has a loaded context (avoids the
 * "no list was loaded" error that fires when pausing an unloaded player).
 */
async function nuclearPause(): Promise<void> {
  console.log("[Player] NUCLEAR PAUSE");

  // Always fire REST API pause — this reaches Spotify's server directly.
  if (deviceId) {
    pausePlayback(deviceId).catch((e) => console.warn("[Player] REST pause error:", e));
  }

  // Only use SDK pause if the SDK already has state (track loaded).
  // Calling player.pause() before a track is loaded causes "no list was loaded".
  if (player) {
    try {
      const state = await player.getCurrentState();
      if (state) {
        await player.pause();
        console.log("[Player] SDK pause OK");
      } else {
        console.log("[Player] SDK has no state — REST pause only");
      }
    } catch { /* ignore */ }
  }

  // Wait briefly, then verify
  await new Promise(r => setTimeout(r, 80));

  if (player) {
    try {
      const state = await player.getCurrentState();
      if (state && !state.paused) {
        console.warn("[Player] Still playing — retry pause");
        if (deviceId) pausePlayback(deviceId).catch(() => {});
        await player.pause().catch(() => {});
        await new Promise(r => setTimeout(r, 100));
        const state2 = await player.getCurrentState();
        if (state2 && !state2.paused) {
          console.warn("[Player] Still playing after retry — muting as last resort");
          try {
            if (player) await player.setVolume(0);
            if (player) await player.pause();
          } catch {
            /* ignore — we did our best */
          }
        }
      } else {
        console.log("[Player] Confirmed paused");
      }
    } catch { /* ignore */ }
  }
}

let listenerCleanupTimer: ReturnType<typeof setTimeout> | null = null;

function cleanupWatchdog(): void {
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
  }
}

function cleanupListener(): void {
  if (listenerCleanupTimer) {
    clearTimeout(listenerCleanupTimer);
    listenerCleanupTimer = null;
  }
  if (player && activeStateListener) {
    player.removeListener("player_state_changed", activeStateListener);
    activeStateListener = null;
  }
}

function cleanupSnippetInfra(): void {
  cleanupWatchdog();
  cleanupListener();
}

/**
 * Play a snippet of a track for a specific duration.
 *
 * Key design decisions:
 * - startTime is set BEFORE playTrack is called so timers always fire at the
 *   right wall-clock offset, regardless of API latency.
 * - No confirmation polling loop — it was eating into short snippets and
 *   delaying timer arming. The player_state_changed listener handles late starts.
 * - nuclearPause checks SDK state before calling player.pause() to avoid the
 *   "no list was loaded" error that fires when the SDK hasn't loaded a context yet.
 */
export async function playSnippet(
  trackUri: string,
  durationMs: number,
  onSnippetEnd?: () => void,
  startOffsetMs: number = DEFAULT_START_OFFSET_MS
): Promise<void> {
  if (!deviceId) throw new Error("Player not ready");

  if (durationMs <= 0 || durationMs > 600000) {
    console.error(`[Player] Invalid duration: ${durationMs}ms`);
    throw new Error(`Invalid snippet duration: ${durationMs}ms`);
  }

  // Invalidate all previous sessions and clean up their timers/listeners.
  snippetSessionId++;
  const currentSession = snippetSessionId;
  cleanupSnippetInfra();
  snippetEnded = false;

  // Restore volume (previous nuclearPause may have muted as last resort)
  try {
    if (player) await player.setVolume(0.8);
  } catch {
    /* ignore — player may be in transitional state */
  }

  console.log(`[Player] ════════════════════════════════════`);
  console.log(`[Player] SNIPPET START (Session ${currentSession})`);
  console.log(`[Player] ${durationMs}ms | offset ${startOffsetMs}ms | ${trackUri}`);
  console.log(`[Player] ════════════════════════════════════`);

  // Set startTime BEFORE firing playTrack so all timers are anchored to
  // when we requested playback, not when the API responded.
  const startTime = performance.now();
  const targetEndPosition = startOffsetMs + durationMs;

  // ── endSnippet: single gate that stops everything ──
  const endSnippet = async (reason: string) => {
    if (currentSession !== snippetSessionId) return;
    if (snippetEnded) return;
    snippetEnded = true;

    const elapsed = performance.now() - startTime;
    console.log(`[Player] ────────────────────────────────────`);
    console.log(`[Player] SNIPPET END (Session ${currentSession}): ${reason}`);
    console.log(`[Player] Elapsed: ${elapsed.toFixed(0)}ms / ${durationMs}ms`);
    console.log(`[Player] ────────────────────────────────────`);

    cleanupWatchdog();
    await nuclearPause();
    onSnippetEnd?.();

    // Shotgun pause retries: cover late-arriving play commands from Spotify
    const sessionAtEnd = snippetSessionId;
    [300, 800, 1500].forEach(delay =>
      setTimeout(() => {
        if (snippetSessionId === sessionAtEnd && snippetEnded && deviceId)
          pausePlayback(deviceId).catch(() => {});
      }, delay)
    );

    // Keep the state listener alive for 3s as a guard against late playback
    listenerCleanupTimer = setTimeout(() => cleanupListener(), 3000);
  };

  // ── Layer 4: player_state_changed (event-driven safety net) ──
  // This is the primary defense against late-arriving play commands:
  // if playback starts AFTER endSnippet has already fired, this pauses immediately.
  if (player) {
    activeStateListener = (state: Spotify.PlaybackState) => {
      if (!state || state.paused) return;

      // Stale listener from a previous session — shouldn't happen but guard anyway
      if (currentSession !== snippetSessionId) {
        console.warn("[Player] STATE: stale session, force pause");
        nuclearPause();
        return;
      }

      // Snippet ended but playback resumed (late play command arrived)
      if (snippetEnded) {
        console.warn("[Player] STATE: playback after snippet ended, force pause");
        nuclearPause();
        return;
      }

      // Snippet still running — check if position exceeded target
      if (state.position >= targetEndPosition) {
        endSnippet(`state_changed: pos ${state.position}ms >= target ${targetEndPosition}ms`);
      }
    };
    player.addListener("player_state_changed", activeStateListener);
  }

  // ── Send play command ──
  try {
    await playTrack(trackUri, deviceId, startOffsetMs);
  } catch (err) {
    console.error("[Player] playTrack failed:", err);
    cleanupSnippetInfra();
    throw err;
  }

  // ── Layer 5: Post-playTrack race guard ──
  // If endSnippet fired while we were awaiting the API call, the pause was sent
  // before the device started playing. The play command may arrive AFTER the pause.
  // Re-pause now to cover the gap. The state listener will handle any future starts.
  if (snippetEnded || currentSession !== snippetSessionId) {
    console.warn("[Player] Snippet ended during API call — re-pausing");
    await nuclearPause();
    return;
  }

  const elapsedAfterPlay = performance.now() - startTime;
  console.log(`[Player] playTrack resolved at ${elapsedAfterPlay.toFixed(0)}ms`);

  if (elapsedAfterPlay >= durationMs) {
    // API call took longer than the entire snippet — end it now.
    // player_state_changed listener is still active and will catch any late audio.
    await endSnippet(`API call took ${elapsedAfterPlay.toFixed(0)}ms >= ${durationMs}ms`);
    return;
  }

  const remainingMs = durationMs - elapsedAfterPlay;
  console.log(`[Player] ${remainingMs.toFixed(0)}ms remaining — arming timers`);

  // ── Layer 1: Recursive elapsed-time checker ──
  const checkTime = async () => {
    if (currentSession !== snippetSessionId || snippetEnded) return;

    const elapsed = performance.now() - startTime;

    if (elapsed >= durationMs) {
      endSnippet(`timer: ${elapsed.toFixed(0)}ms >= ${durationMs}ms`);
      return;
    }

    // Position check (only after 500ms to let playback stabilise)
    if (player && elapsed > 500) {
      try {
        const state = await player.getCurrentState();
        if (state && !state.paused && state.position >= targetEndPosition) {
          endSnippet(`position: ${state.position}ms >= ${targetEndPosition}ms`);
          return;
        }
      } catch { /* ignore */ }
    }

    const left = durationMs - elapsed;
    setTimeout(checkTime, left < 200 ? 15 : 40);
  };

  setTimeout(checkTime, 30);

  // ── Layer 2: Hard backup timeout ──
  setTimeout(() => {
    if (currentSession === snippetSessionId && !snippetEnded) {
      console.log(`[Player] BACKUP TIMEOUT at ${(performance.now() - startTime).toFixed(0)}ms`);
      endSnippet("backup timeout");
    }
  }, remainingMs + 200);

  // ── Layer 3: Watchdog interval (position + emergency) ──
  let lastLoggedSecond = -1;
  watchdogInterval = setInterval(async () => {
    if (currentSession !== snippetSessionId || snippetEnded) {
      if (watchdogInterval) { clearInterval(watchdogInterval); watchdogInterval = null; }
      return;
    }

    const elapsed = performance.now() - startTime;
    const sec = Math.floor(elapsed / 1000);
    if (sec !== lastLoggedSecond) {
      lastLoggedSecond = sec;
      console.log(`[Player] ${sec}s / ${(durationMs / 1000).toFixed(0)}s`);
    }

    if (player) {
      try {
        const state = await player.getCurrentState();
        if (state && !state.paused && state.position >= targetEndPosition) {
          if (watchdogInterval) { clearInterval(watchdogInterval); watchdogInterval = null; }
          await endSnippet(`watchdog: position ${state.position}ms >= ${targetEndPosition}ms`);
          return;
        }
      } catch { /* ignore */ }
    }

    if (elapsed > durationMs + 500) {
      console.error(`[Player] WATCHDOG EMERGENCY: ${elapsed.toFixed(0)}ms`);
      if (watchdogInterval) { clearInterval(watchdogInterval); watchdogInterval = null; }
      await endSnippet("watchdog emergency");
    }
  }, 200);
}

export async function stopSnippet(): Promise<void> {
  console.log(`[Player] stopSnippet — invalidating session ${snippetSessionId}`);
  snippetSessionId++;
  snippetEnded = true;
  cleanupSnippetInfra();
  await nuclearPause();
}

export function getDeviceId(): string | null {
  return deviceId;
}

export function disconnectPlayer(): void {
  snippetSessionId++;
  snippetEnded = true;
  cleanupSnippetInfra();
  if (player) {
    player.disconnect();
    player = null;
    deviceId = null;
  }
  isConnecting = false;
}
