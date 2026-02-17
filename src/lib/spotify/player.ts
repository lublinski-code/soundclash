// ─── Spotify Web Playback SDK Wrapper (Singleton) ───

import { getAccessToken } from "./auth";
import { playTrack, pausePlayback, transferPlayback } from "./api";

let player: Spotify.Player | null = null;
let deviceId: string | null = null;
let snippetTimeout: ReturnType<typeof setTimeout> | null = null;
let positionPollInterval: ReturnType<typeof setInterval> | null = null;
let isConnecting = false;

/** Default offset to skip silent intros (ms) */
const DEFAULT_START_OFFSET_MS = 2500;

type PlayerReadyCallback = (id: string) => void;
type PlayerErrorCallback = (error: string) => void;

/**
 * Check if the player is already connected and has a device ID.
 */
export function isPlayerConnected(): boolean {
  return player !== null && deviceId !== null;
}

/**
 * Load the Spotify Web Playback SDK script into the page.
 */
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

/**
 * Initialize the Spotify player (singleton).
 * If already connected, calls onReady immediately with the existing device ID.
 */
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
    try {
      player.disconnect();
    } catch {
      // ignore
    }
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

/**
 * Play a snippet of a track for a specific duration.
 *
 * Fixes for the "plays whole song" bug:
 *   1. Timer starts AFTER playTrack() resolves (not before)
 *   2. Position polling safety net: checks every 250ms and force-pauses
 *      if playback exceeds the intended duration
 *   3. Elapsed time fallback: uses performance.now() as backup
 *   4. All existing timers/polls are cleared before starting
 *
 * @param trackUri   Spotify track URI
 * @param durationMs How long to play (in ms)
 * @param onSnippetEnd Callback when snippet finishes
 * @param startOffsetMs Position to start from (default 2.5s to skip silent intros)
 */
export async function playSnippet(
  trackUri: string,
  durationMs: number,
  onSnippetEnd?: () => void,
  startOffsetMs: number = DEFAULT_START_OFFSET_MS
): Promise<void> {
  if (!deviceId) throw new Error("Player not ready");

  // Clear any existing snippet timers
  clearSnippetTimers();

  // Start playback at offset, AWAIT completion before starting timer
  await playTrack(trackUri, deviceId, startOffsetMs);

  const maxPositionMs = startOffsetMs + durationMs;
  const startTime = performance.now();
  let ended = false;

  const endSnippet = async () => {
    if (ended) return;
    ended = true;
    clearSnippetTimers();
    try {
      if (deviceId) await pausePlayback(deviceId);
    } catch {
      // Ignore pause errors
    }
    onSnippetEnd?.();
  };

  // Primary timer: fire after durationMs
  snippetTimeout = setTimeout(endSnippet, durationMs);

  // Safety net: poll every 250ms using BOTH position AND elapsed time
  // If the browser throttled the setTimeout (e.g. tab in background),
  // this catches runaway playback.
  if (player) {
    positionPollInterval = setInterval(async () => {
      if (ended || !player) {
        clearSnippetTimers();
        return;
      }

      // Fallback 1: Check elapsed wall-clock time (always reliable)
      const elapsedMs = performance.now() - startTime;
      if (elapsedMs >= durationMs + 100) {
        // 100ms grace period
        console.warn(
          `[Player] Elapsed time safety net: ${elapsedMs.toFixed(0)}ms >= ${durationMs}ms, force-pausing`
        );
        await endSnippet();
        return;
      }

      // Fallback 2: Check Spotify's reported position
      try {
        const state = await player.getCurrentState();
        if (state && state.position >= maxPositionMs) {
          console.warn(
            `[Player] Position safety net: ${state.position}ms >= ${maxPositionMs}ms, force-pausing`
          );
          await endSnippet();
        }
      } catch {
        // Ignore polling errors
      }
    }, 250);
  }
}

/**
 * Stop the current snippet and clear all timers.
 */
export async function stopSnippet(): Promise<void> {
  clearSnippetTimers();
  try {
    if (deviceId) await pausePlayback(deviceId);
  } catch {
    // Ignore
  }
}

/**
 * Clear snippet timeout and position polling interval.
 */
function clearSnippetTimers(): void {
  if (snippetTimeout) {
    clearTimeout(snippetTimeout);
    snippetTimeout = null;
  }
  if (positionPollInterval) {
    clearInterval(positionPollInterval);
    positionPollInterval = null;
  }
}

/**
 * Get the current device ID.
 */
export function getDeviceId(): string | null {
  return deviceId;
}

/**
 * Disconnect and clean up the player.
 */
export function disconnectPlayer(): void {
  clearSnippetTimers();
  if (player) {
    player.disconnect();
    player = null;
    deviceId = null;
  }
  isConnecting = false;
}
