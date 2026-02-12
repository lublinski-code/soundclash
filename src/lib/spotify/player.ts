// ─── Spotify Web Playback SDK Wrapper ───

import { getAccessToken } from "./auth";
import { playTrack, pausePlayback, transferPlayback } from "./api";

let player: Spotify.Player | null = null;
let deviceId: string | null = null;
let snippetTimeout: ReturnType<typeof setTimeout> | null = null;

type PlayerReadyCallback = (id: string) => void;
type PlayerErrorCallback = (error: string) => void;

/**
 * Load the Spotify Web Playback SDK script into the page.
 */
export function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
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
 * Initialize the Spotify player.
 */
export async function initPlayer(
  onReady?: PlayerReadyCallback,
  onError?: PlayerErrorCallback
): Promise<void> {
  console.log("🎵 Loading Spotify SDK...");
  
  try {
    await loadSpotifySDK();
    console.log("✓ SDK loaded");
  } catch (err) {
    console.error("Failed to load SDK:", err);
    onError?.("Failed to load Spotify SDK");
    return;
  }

  const token = await getAccessToken();
  if (!token) {
    console.error("No access token");
    onError?.("No access token available");
    return;
  }

  console.log("🎵 Creating player...");
  
  player = new window.Spotify.Player({
    name: "SoundClash",
    getOAuthToken: async (cb) => {
      const t = await getAccessToken();
      console.log("SDK requested token:", t ? "✓" : "✗");
      cb(t ?? "");
    },
    volume: 0.8,
  });

  player.addListener("ready", async ({ device_id }) => {
    console.log("✓ Player ready, device ID:", device_id);
    deviceId = device_id;
    
    // Transfer playback to this device (optional, may fail if no active session)
    try {
      await transferPlayback(device_id);
      console.log("✓ Playback transferred");
    } catch (err) {
      console.warn("Could not transfer playback (this is OK):", err);
      // Not a critical error - device is still ready
    }
    
    onReady?.(device_id);
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.warn("Device not ready:", device_id);
    deviceId = null;
    onError?.("Device went offline");
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error("Init error:", message);
    onError?.(`Init error: ${message}`);
  });

  player.addListener("authentication_error", ({ message }) => {
    console.error("Auth error:", message);
    onError?.(`Auth error: ${message}`);
  });

  player.addListener("account_error", ({ message }) => {
    console.error("Account error:", message);
    onError?.(`Account error (Premium required): ${message}`);
  });

  player.addListener("playback_error", ({ message }) => {
    console.error("Playback error:", message);
  });

  console.log("🎵 Connecting player...");
  const success = await player.connect();
  console.log("Connect result:", success);
}

/**
 * Play a snippet of a track for a specific duration.
 * @param trackUri - Spotify URI (e.g., "spotify:track:xxx")
 * @param durationMs - How long to play in milliseconds
 * @param onSnippetEnd - Callback when snippet playback ends
 */
export async function playSnippet(
  trackUri: string,
  durationMs: number,
  onSnippetEnd?: () => void
): Promise<void> {
  if (!deviceId) throw new Error("Player not ready");

  // Clear any existing snippet timeout
  stopSnippet();

  // Start playing from the beginning
  await playTrack(trackUri, deviceId, 0);

  // Set timeout to pause after duration
  snippetTimeout = setTimeout(async () => {
    try {
      if (deviceId) await pausePlayback(deviceId);
    } catch {
      // Ignore pause errors
    }
    onSnippetEnd?.();
  }, durationMs);
}

/**
 * Stop the current snippet and clear the timer.
 */
export async function stopSnippet(): Promise<void> {
  if (snippetTimeout) {
    clearTimeout(snippetTimeout);
    snippetTimeout = null;
  }
  try {
    if (deviceId) await pausePlayback(deviceId);
  } catch {
    // Ignore
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
  stopSnippet();
  if (player) {
    player.disconnect();
    player = null;
    deviceId = null;
  }
}
