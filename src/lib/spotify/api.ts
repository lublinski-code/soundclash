// ─── Spotify Web API Helpers ───

import { getAccessToken } from "./auth";
import type { SpotifyTrack } from "../game/types";

const BASE_URL = "https://api.spotify.com/v1";

async function spotifyFetch<T>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated with Spotify");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify API error ${response.status}: ${JSON.stringify(error)}`
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
 * Search for tracks using genre as a keyword (more reliable than genre: filter).
 * Uses the genre name as a regular search term combined with year filter.
 */
export async function searchTracksByGenre(
  genre: string,
  yearRange?: string,
  market?: string,
  offset = 0,
  limit = 50
): Promise<SpotifyTrack[]> {
  // Use genre as keyword — much more reliable than genre: filter
  let q = genre;
  if (yearRange) q += ` year:${yearRange}`;

  const params = new URLSearchParams({
    q,
    type: "track",
    limit: String(limit),
    offset: String(offset),
  });
  if (market) params.set("market", market);

  try {
    const data = await spotifyFetch<{
      tracks: { items: SpotifyTrack[] };
    }>(`/search?${params.toString()}`);
    return data.tracks.items ?? [];
  } catch (err) {
    console.warn(`Search failed for "${q}":`, err);
    return [];
  }
}

/**
 * Search for playlists by keyword, then extract tracks.
 * This is the most reliable way to get recognizable songs for a genre.
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
        items: { id: string; name: string; owner: { id: string }; tracks: { total: number } }[];
      };
    }>(`/search?${params.toString()}`);

    const items = (data.playlists?.items ?? []).filter(
      (p) => p && p.id && p.tracks?.total > 0
    );

    // Sort: prefer larger playlists (more songs to pick from)
    items.sort((a, b) => (b.tracks?.total ?? 0) - (a.tracks?.total ?? 0));

    console.log(
      `[API] searchPlaylists("${query}"): ${items.length} results`,
      items.map((p) => `${p.name} (${p.tracks?.total} tracks, by ${p.owner?.id})`).join(", ")
    );

    return items;
  } catch (err) {
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
      items: { track: Record<string, unknown> | null; is_local?: boolean }[];
    }>(`/playlists/${playlistId}/tracks?${params.toString()}`);

    if (!data || !Array.isArray(data.items)) {
      console.warn(`[API] getPlaylistTracks(${playlistId}): unexpected response shape`, data);
      return [];
    }

    const tracks = data.items
      .filter((item) => !item.is_local && item.track != null)
      .map((item) => item.track as SpotifyTrack);

    return tracks;
  } catch (err) {
    console.warn(`[API] getPlaylistTracks(${playlistId}) failed:`, err);
    return [];
  }
}

/** Browse category playlists (e.g., "rock", "pop") */
export async function getCategoryPlaylists(
  categoryId: string,
  country?: string,
  limit = 10
): Promise<{ id: string; name: string }[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (country) params.set("country", country);

  try {
    const data = await spotifyFetch<{
      playlists: { items: { id: string; name: string }[] };
    }>(`/browse/categories/${categoryId}/playlists?${params.toString()}`);
    return data.playlists.items ?? [];
  } catch {
    return [];
  }
}

/** Get the current user's profile */
export async function getCurrentUser(): Promise<{
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string; // "premium" | "free" | "open"
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

  await fetch(`${BASE_URL}/me/player/play?device_id=${deviceId}`, {
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
