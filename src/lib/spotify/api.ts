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
    // Capture the full error body for diagnostics
    const body = await response.json().catch(() => null);
    console.error(`[Spotify API] ${response.status} on ${endpoint.split("?")[0]}`, body);

    if (response.status === 401) {
      throw new SpotifyAuthError(`Spotify session expired. Please reconnect.`);
    }

    if (response.status === 403) {
      const reason = body?.error?.message ?? body?.error?.reason ?? JSON.stringify(body);
      throw new SpotifyAuthError(`Spotify API 403: ${endpoint.split("?")[0]} — ${reason}`);
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
