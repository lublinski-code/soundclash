// ─── Song Pool: Build a Game Track List ───
// Hybrid strategy:
//   1. Server API route (/api/songs) uses Client Credentials for search + playlists
//   2. Client-side batch fetch with user token to get preview URLs
//   3. Filter out tracks without preview URLs

import type { SpotifyTrack, GameConfig } from "../game/types";
import { getAccessToken } from "../spotify/auth";

const SPOTIFY_BASE = "https://api.spotify.com/v1";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type ServerTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  uri: string;
  duration_ms: number;
  spotifyUrl: string;
};

/**
 * Fetch track details in batches of 50 using the user's auth token.
 * This is needed because preview_url is only reliably returned with user tokens.
 */
async function batchFetchPreviews(
  trackIds: string[],
  token: string,
  market: string
): Promise<Map<string, string>> {
  const previews = new Map<string, string>();
  const batchSize = 50;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);
    const resp = await fetch(
      `${SPOTIFY_BASE}/tracks?ids=${batch.join(",")}&market=${market}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!resp.ok) {
      console.warn(`[SongPool] Batch fetch failed: ${resp.status}`);
      continue;
    }

    const data = await resp.json();
    for (const track of data.tracks ?? []) {
      if (track?.preview_url) {
        previews.set(track.id, track.preview_url);
      }
    }
  }

  return previews;
}

/**
 * Build a song pool using the hybrid server/client approach.
 */
export async function buildSongPool(
  config: GameConfig,
  targetSize = 60
): Promise<SpotifyTrack[]> {
  const { genres, eras, market } = config;

  if (genres.length === 0) {
    console.warn("[SongPool] No genres selected");
    return [];
  }

  console.log(`[SongPool] Building pool: genres=[${genres.join(", ")}], eras=[${(eras ?? []).join(", ")}], market=${market}`);

  // Step 1: Fetch candidates from server route (Client Credentials)
  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, market }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Song pool API failed: ${resp.status}`);
  }

  const { tracks: serverTracks } = (await resp.json()) as { tracks: ServerTrack[] };
  console.log(`[SongPool] Server returned ${serverTracks.length} candidates`);

  if (serverTracks.length === 0) return [];

  // Step 2: Batch fetch preview URLs using user's auth token
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated. Please reconnect to Spotify.");

  const trackIds = serverTracks.map(t => t.id);
  const previews = await batchFetchPreviews(trackIds, token, market);
  console.log(`[SongPool] Preview URLs found: ${previews.size}/${trackIds.length}`);

  // Step 3: Merge and filter — only keep tracks with preview URLs
  const pool: SpotifyTrack[] = [];
  for (const st of serverTracks) {
    const previewUrl = previews.get(st.id);
    if (!previewUrl) continue;

    pool.push({
      id: st.id,
      name: st.name,
      artists: st.artists,
      album: st.album,
      uri: st.uri,
      duration_ms: st.duration_ms,
      previewUrl,
      spotifyUrl: st.spotifyUrl,
    });
  }

  const result = shuffle(pool).slice(0, targetSize);
  console.log(`[SongPool] Final pool: ${result.length} tracks with previews`);

  return result;
}
