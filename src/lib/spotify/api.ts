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

/**
 * Search for tracks (used for guess autocomplete).
 * Routes through /api/search which uses Client Credentials — no user login needed.
 */
export async function searchTracks(
  query: string,
  limit = 5,
  market?: string
): Promise<SpotifyTrack[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });
  if (market) params.set("market", market);

  const resp = await fetch(`/api/search?${params.toString()}`);
  if (!resp.ok) return [];

  const data = await resp.json();
  return data.tracks ?? [];
}

/** Get the current user's profile (requires user OAuth) */
export async function getCurrentUser(): Promise<{
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
  product: string;
}> {
  return spotifyFetch("/me");
}
