// ─── Song Pool: Build a Game Track List ───
// Server API route (/api/songs) handles all Spotify fetching.
// If the user is logged in, their token is sent for better preview coverage.
// Works without user auth — falls back to Client Credentials + iTunes previews.

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

  let userToken: string | null = null;
  try {
    userToken = await getAccessToken();
  } catch {
    // No user auth — that's fine, server will use Client Credentials
  }

  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, market, userToken }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Song pool API failed: ${resp.status}`);
  }

  const { tracks: serverTracks } = (await resp.json()) as { tracks: ServerTrack[] };
  console.log(`[SongPool] Server returned ${serverTracks.length} tracks with previews`);

  if (serverTracks.length === 0) return [];

  const pool: SpotifyTrack[] = serverTracks.map(st => ({
    id: st.id,
    name: st.name,
    artists: st.artists,
    album: st.album,
    uri: st.uri,
    duration_ms: st.duration_ms,
    previewUrl: st.previewUrl,
    spotifyUrl: st.spotifyUrl,
  }));

  const result = shuffle(pool).slice(0, targetSize);
  console.log(`[SongPool] Final pool: ${result.length} tracks`);

  return result;
}
