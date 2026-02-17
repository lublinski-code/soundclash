// ─── Spotify Web API Helpers ───

import { getAccessToken } from "./auth";
import type { SpotifyTrack } from "../game/types";

const BASE_URL = "https://api.spotify.com/v1";

/** Custom error for auth-related Spotify failures */
export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyAuthError";
  }
}

async function spotifyFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new SpotifyAuthError("Not authenticated with Spotify");

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    // Only 401 = session expired. 403 on a specific resource just means
    // "access denied to this resource" (e.g., private playlist), not session expiry.
    if (response.status === 401) {
      throw new SpotifyAuthError(
        `Spotify session expired. Please reconnect.`
      );
    }

    throw new Error(
      `Spotify API ${response.status}: ${endpoint.split("?")[0]}`
    );
  }

  return response.json();
}

/** Search for tracks (used for guess autocomplete) */
export async function searchTracks(
  query: string,
  limit = 5,
  market?: string
): Promise<SpotifyTrack[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
  });
  if (market) params.set("market", market);

  const data = await spotifyFetch<{
    tracks: { items: SpotifyTrack[] };
  }>(`/search?${params.toString()}`);

  return data.tracks.items;
}

/**
 * Search for tracks using genre as a keyword.
 * No year filter -- kept simple for reliability.
 */
export async function searchTracksByGenre(
  genre: string,
  market?: string,
  offset = 0,
  limit = 50
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: genre,
    type: "track",
    limit: String(limit),
    offset: String(offset),
  });
  if (market) params.set("market", market);

  try {
    const data = await spotifyFetch<{
      tracks: { items: (SpotifyTrack | null)[] };
    }>(`/search?${params.toString()}`);
    return (data.tracks?.items ?? []).filter((t): t is SpotifyTrack => t !== null && t !== undefined);
  } catch (err) {
    if (err instanceof SpotifyAuthError) throw err;
    console.warn(`[API] Search failed for "${genre}":`, err);
    return [];
  }
}

/**
 * Search for playlists by keyword.
 * Note: Spotify can return null items in the array for deleted/unavailable playlists.
 */
export async function searchPlaylists(
  query: string,
  market?: string,
  limit = 5
): Promise<{ id: string; name: string }[]> {
  const params = new URLSearchParams({
    q: query,
    type: "playlist",
    limit: String(limit),
  });
  if (market) params.set("market", market);

  try {
    const data = await spotifyFetch<{
      playlists: {
        items: ({ id: string; name: string; owner: { id: string }; tracks: { total: number } } | null)[];
      };
    }>(`/search?${params.toString()}`);

    const rawItems = data.playlists?.items ?? [];

    // Filter out null/deleted playlists and those with no tracks
    const items = rawItems.filter(
      (p): p is NonNullable<typeof p> =>
        p !== null && p !== undefined && typeof p.id === "string" && !!p.id && (p.tracks?.total ?? 0) > 0
    );

    items.sort((a, b) => (b.tracks?.total ?? 0) - (a.tracks?.total ?? 0));

    return items;
  } catch (err) {
    if (err instanceof SpotifyAuthError) throw err;
    console.warn(`[API] Playlist search failed for "${query}":`, err);
    return [];
  }
}

/** Get tracks from a specific playlist */
export async function getPlaylistTracks(
  playlistId: string,
  market?: string,
  limit = 100
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    limit: String(limit),
  });
  if (market) params.set("market", market);

  try {
    const data = await spotifyFetch<{
      items: ({ track: Record<string, unknown> | null; is_local?: boolean } | null)[];
    }>(`/playlists/${playlistId}/tracks?${params.toString()}`);

    if (!data || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .filter(
        (item): item is { track: Record<string, unknown>; is_local?: boolean } =>
          item !== null && item !== undefined && !item.is_local && item.track != null
      )
      .map((item) => item.track as SpotifyTrack);
  } catch (err) {
    if (err instanceof SpotifyAuthError) throw err;
    console.warn(`[API] getPlaylistTracks(${playlistId}) failed:`, err);
    return [];
  }
}

/** Get the current user's profile */
export async function getCurrentUser(): Promise<{
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
}> {
  return spotifyFetch("/me");
}

/** Transfer playback to a device */
export async function transferPlayback(deviceId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  await fetch(`${BASE_URL}/me/player`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

/** Play a specific track on a device */
export async function playTrack(
  trackUri: string,
  deviceId: string,
  positionMs = 0
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${BASE_URL}/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [trackUri],
      position_ms: positionMs,
    }),
  });

  // 204 No Content = success, 202 Accepted = async processing
  if (!response.ok && response.status !== 204 && response.status !== 202) {
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`Play failed (${response.status}): ${err}`);
  }
}

/** Pause playback */
export async function pausePlayback(deviceId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  await fetch(`${BASE_URL}/me/player/pause?device_id=${deviceId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Create a playlist and add tracks to it */
export async function createPlaylist(
  name: string,
  trackUris: string[],
  description = ""
): Promise<{ id: string; external_urls: { spotify: string } }> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  // Get user ID
  const user = await getCurrentUser();

  // Create playlist
  const createResp = await fetch(`${BASE_URL}/users/${user.id}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });

  if (!createResp.ok) {
    const err = await createResp.text();
    throw new Error(`Failed to create playlist: ${err}`);
  }

  const playlist = await createResp.json();

  // Add tracks (max 100 per request)
  for (let i = 0; i < trackUris.length; i += 100) {
    const batch = trackUris.slice(i, i + 100);
    await fetch(`${BASE_URL}/playlists/${playlist.id}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: batch }),
    });
  }

  return playlist;
}
