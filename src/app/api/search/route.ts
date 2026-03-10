import { NextResponse } from "next/server";

const DEEZER_BASE = "https://api.deezer.com";

type DeezerTrack = {
  id: number;
  title: string;
  duration: number;
  rank: number;
  preview: string;
  artist: { id: number; name: string };
  album: {
    id: number;
    title: string;
    cover_xl: string;
    cover_big: string;
    cover_medium: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 6), 20);

    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      order: "RANKING",
    });

    const resp = await fetch(`${DEEZER_BASE}/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) {
      console.warn(`[API/search] Deezer ${resp.status} for query "${query}"`);
      return NextResponse.json({ tracks: [] });
    }

    const data = await resp.json();
    if (data.error) {
      console.warn("[API/search] Deezer error:", data.error);
      return NextResponse.json({ tracks: [] });
    }

    const tracks = ((data.data ?? []) as DeezerTrack[]).map((t) => ({
      id: String(t.id),
      name: t.title,
      artists: [{ id: String(t.artist.id), name: t.artist.name }],
      album: {
        id: String(t.album.id),
        name: t.album.title,
        images: [
          {
            url: t.album.cover_xl || t.album.cover_big || t.album.cover_medium,
            width: 640,
            height: 640,
          },
        ],
      },
      duration_ms: t.duration * 1000,
    }));

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[API/search] Error:", err);
    return NextResponse.json({ tracks: [] });
  }
}
