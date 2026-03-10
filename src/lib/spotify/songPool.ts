// ─── Song Pool: Build a Game Track List ───
// Server API route (/api/songs) handles all Spotify fetching.
// The user's access token is sent to the server so it can resolve preview_url
// server-side (user tokens have much better preview coverage than CC tokens).

import type { SpotifyTrack, GameConfig } from "../game/types";
import { getAccessToken } from "../spotify/auth";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Reorders tracks so the same artist doesn't appear within `minGap` positions
 * of their previous occurrence. Falls back gracefully when the pool is too
 * small to satisfy the spacing constraint.
 */
function spaceArtists<T extends { artists: { name: string }[] }>(
  tracks: T[],
  minGap = 5
): T[] {
  const result: T[] = [];
  const remaining = [...tracks];
  const lastSeen = new Map<string, number>();

  while (remaining.length > 0) {
    const idx = result.length;

    const pick = remaining.findIndex((t) => {
      const artist = t.artists[0]?.name ?? "unknown";
      const last = lastSeen.get(artist) ?? -Infinity;
      return idx - last >= minGap;
    });

    const chosen = pick === -1 ? 0 : pick;
    const [track] = remaining.splice(chosen, 1);
    result.push(track);
    lastSeen.set(track.artists[0]?.name ?? "unknown", idx);
  }

  return result;
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
  previewUrl: string;
  spotifyUrl: string;
};

function mapServerTracks(serverTracks: ServerTrack[]): SpotifyTrack[] {
  return serverTracks.map(st => ({
    id: st.id,
    name: st.name,
    artists: st.artists,
    album: st.album,
    uri: st.uri,
    duration_ms: st.duration_ms,
    previewUrl: st.previewUrl,
    spotifyUrl: st.spotifyUrl,
  }));
}

/**
 * Fast fetch: grabs a small number of songs quickly (no iTunes, no batch preview fetch).
 * Used to start the game immediately while the full pool loads in the background.
 */
export async function buildQuickSong(
  config: GameConfig,
  count = 3
): Promise<SpotifyTrack[]> {
  const { genres, eras, market } = config;
  if (genres.length === 0) return [];

  console.log(`[SongPool] Quick fetch: ${count} songs for genres=[${genres.join(", ")}]`);

  const userToken = await getAccessToken();

  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, market, quick: true, quickCount: count, userToken }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Quick song fetch failed: ${resp.status}`);
  }

  const { tracks: serverTracks } = (await resp.json()) as { tracks: ServerTrack[] };
  console.log(`[SongPool] Quick fetch returned ${serverTracks.length} tracks`);

  return mapServerTracks(serverTracks);
}

export async function buildSongPool(
  config: GameConfig,
  targetSize = 60,
  excludeIds: string[] = []
): Promise<SpotifyTrack[]> {
  const { genres, eras, market } = config;

  if (genres.length === 0) {
    console.warn("[SongPool] No genres selected");
    return [];
  }

  console.log(`[SongPool] Building pool: genres=[${genres.join(", ")}], eras=[${(eras ?? []).join(", ")}], market=${market}, excluding=${excludeIds.length} songs`);

  const userToken = await getAccessToken();

  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, market, userToken, excludeIds }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Song pool API failed: ${resp.status}`);
  }

  const { tracks: serverTracks } = (await resp.json()) as { tracks: ServerTrack[] };
  console.log(`[SongPool] Server returned ${serverTracks.length} tracks with previews`);

  if (serverTracks.length === 0) return [];

  const pool = mapServerTracks(serverTracks);
  const result = spaceArtists(shuffle(pool)).slice(0, targetSize);
  console.log(`[SongPool] Final pool: ${result.length} tracks`);

  return result;
}

/**
 * Replenish the song pool during gameplay when songs are running low.
 * Excludes songs already in the current pool to avoid repeats.
 */
export async function replenishPool(
  config: GameConfig,
  existingPool: SpotifyTrack[],
  targetSize = 40
): Promise<SpotifyTrack[]> {
  const excludeIds = existingPool.map(s => s.id);
  console.log(`[SongPool] Replenishing pool, excluding ${excludeIds.length} existing songs`);
  return buildSongPool(config, targetSize, excludeIds);
}
