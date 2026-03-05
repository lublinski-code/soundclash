import { NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify/clientToken";

const BASE = "https://api.spotify.com/v1";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(Number(searchParams.get("limit") ?? 6), 20);
    const market = searchParams.get("market") || undefined;

    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    const token = await getClientCredentialsToken();

    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: String(limit),
    });
    if (market) params.set("market", market);

    const resp = await fetch(`${BASE}/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      console.warn(`[API/search] Spotify ${resp.status} for query "${query}"`);
      return NextResponse.json({ tracks: [] });
    }

    const data = await resp.json();
    const tracks = (data.tracks?.items ?? []).map((t: Record<string, unknown>) => ({
      id: t.id,
      name: t.name,
      artists: (t.artists as Array<{ id: string; name: string }>)?.map((a) => ({
        id: a.id,
        name: a.name,
      })),
      album: {
        id: (t.album as Record<string, unknown>)?.id,
        name: (t.album as Record<string, unknown>)?.name,
        images: (t.album as Record<string, unknown>)?.images,
      },
      uri: t.uri,
      duration_ms: t.duration_ms,
    }));

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[API/search] Error:", err);
    return NextResponse.json({ tracks: [] });
  }
}
