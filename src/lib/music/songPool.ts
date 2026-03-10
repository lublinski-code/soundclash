import type { Track, GameConfig } from "../game/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  duration_ms: number;
  previewUrl: string;
  songUrl: string;
};

function mapServerTracks(serverTracks: ServerTrack[]): Track[] {
  return serverTracks.map(st => ({
    id: st.id,
    name: st.name,
    artists: st.artists,
    album: st.album,
    duration_ms: st.duration_ms,
    previewUrl: st.previewUrl,
    songUrl: st.songUrl,
  }));
}

export async function buildQuickSong(
  config: GameConfig,
  count = 3
): Promise<Track[]> {
  const { genres, eras } = config;
  if (genres.length === 0) return [];

  console.log(`[SongPool] Quick fetch: ${count} songs for genres=[${genres.join(", ")}]`);

  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, quick: true, quickCount: count }),
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
): Promise<Track[]> {
  const { genres, eras } = config;

  if (genres.length === 0) {
    console.warn("[SongPool] No genres selected");
    return [];
  }

  console.log(`[SongPool] Building pool: genres=[${genres.join(", ")}], eras=[${(eras ?? []).join(", ")}], excluding=${excludeIds.length} songs`);

  const resp = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genres, eras, excludeIds }),
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

export async function replenishPool(
  config: GameConfig,
  existingPool: Track[],
  targetSize = 40
): Promise<Track[]> {
  const excludeIds = existingPool.map(s => s.id);
  console.log(`[SongPool] Replenishing pool, excluding ${excludeIds.length} existing songs`);
  return buildSongPool(config, targetSize, excludeIds);
}
