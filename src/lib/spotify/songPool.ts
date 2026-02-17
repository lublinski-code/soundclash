// ─── Song Pool: Build a Game Track List ───
// Search-first strategy: prioritizes discovering NEW music the player
// doesn't know. User's own library is only used as a last-resort fallback.
//
// Dev-mode limits (Spotify app in Development Mode):
//   - Search limit capped at ~10 per request
//   - Cannot read OTHER users' playlist tracks (403)
//   - CAN search for tracks, albums, playlists
//   - CAN read the user's OWN playlists & saved tracks
//   - Recommendations API is deprecated (404)

import type { SpotifyTrack, GameConfig } from "../game/types";
import { getAccessToken } from "../spotify/auth";

const BASE = "https://api.spotify.com/v1";
const SEARCH_LIMIT = 10; // Max that works in dev mode

async function requireToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated. Please reconnect to Spotify.");
  return token;
}

async function spFetch(endpoint: string, token: string): Promise<unknown> {
  const resp = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    let body = "";
    try {
      body = await resp.text();
    } catch {
      /* ignore */
    }
    console.warn(
      `[SongPool] API ${resp.status} on ${endpoint.split("?")[0]}: ${body.slice(0, 200)}`
    );
    return null;
  }

  return resp.json();
}

// ─── Helpers ───

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedup(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function isValidTrack(raw: unknown): raw is SpotifyTrack {
  if (!raw || typeof raw !== "object") return false;
  const t = raw as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    !!t.id &&
    typeof t.name === "string" &&
    typeof t.uri === "string" &&
    typeof t.duration_ms === "number" &&
    t.duration_ms > 15000 &&
    Array.isArray(t.artists) &&
    t.artists.length > 0 &&
    !!t.album &&
    typeof t.album === "object"
  );
}

/**
 * Patterns that indicate an obscure track version (demos, live, etc.)
 * These tracks are harder to guess because players may know the original but not this version.
 */
const OBSCURE_PATTERNS = [
  // Demos and rough versions
  /\bdemo\b/i,
  /\bdemos\b/i,
  /\brare\b/i,
  /\bouttake/i,
  /\balternate\s*take/i,
  /\brough\s*mix/i,
  /\bearly\s*version/i,
  /\bwork\s*in\s*progress/i,
  /\bwip\b/i,

  // Live recordings
  /\blive\b/i,
  /\blive\s*at\b/i,
  /\blive\s*from\b/i,
  /\blive\s*in\b/i,
  /\bin\s*concert/i,
  /\brecorded\s*live/i,
  /\bunplugged/i,
  /\bacoustic\s*version/i,
  /\bacoustic\s*live/i,

  // Commentary and non-music
  /\bcommentary\b/i,
  /\binterlude\b/i,
  /\bintro\b/i,
  /\boutro\b/i,
  /\bskit\b/i,
  /\bspoken\s*word/i,
  /\bvoice\s*memo/i,
  /\bvoicemail/i,

  // Covers and karaoke
  /\bcover\b/i,
  /\bkaraoke/i,
  /\binstrumental\b/i,
  /\btribute\s*to\b/i,
  /\bmade\s*famous\s*by/i,
  /\bin\s*the\s*style\s*of/i,

  // Bonus/deluxe content markers
  /\bbonus\s*track/i,
  /\bhidden\s*track/i,
  /\bdeluxe\s*edition\s*bonus/i,
  /\bexclusive\b/i,
  /\bB-?side/i,

  // Remixes (keep radio edits, filter out obscure remixes)
  /\bremix(?!.*radio)/i,  // Remix but NOT "radio remix"
  /\bdub\s*mix/i,
  /\bclub\s*mix/i,
  /\bextended\s*mix/i,

  // Medleys and mashups
  /\bmedley\b/i,
  /\bmashup/i,
  /\bmash-?up/i,

  // Specific album types
  /disc\s*[2-9]/i,       // Disc 2, 3, etc. often have B-sides
  /\bsessions?\b/i,      // "Sessions" albums
  /\brarity/i,
  /\brareties/i,
];

/**
 * Check if a track name suggests it's an obscure version.
 */
function isObscureTrack(track: SpotifyTrack): boolean {
  const name = track.name;
  const albumName = (track.album as Record<string, unknown>)?.name as string || "";

  // Check track name against patterns
  for (const pattern of OBSCURE_PATTERNS) {
    if (pattern.test(name)) {
      return true;
    }
  }

  // Check album name for deluxe/bonus indicators
  const albumObscurePatterns = [
    /\bdeluxe\b/i,
    /\bexpanded\b/i,
    /\banniversary\b/i,
    /\bremaster/i,
    /\bbonus\s*tracks?\b/i,
    /\blive\s*album/i,
    /\bcomplete\s*sessions/i,
    /\bdemos?\b/i,
  ];

  // If album is deluxe AND track position is high (bonus tracks), skip
  // We can't easily get track number from the type, so just check album name
  for (const pattern of albumObscurePatterns) {
    if (pattern.test(albumName)) {
      // Only filter if the track name ALSO has indicators
      // (allows main tracks from deluxe albums)
      const trackHasIndicator = /\bremaster/i.test(name) ||
        /\bbonus/i.test(name) ||
        /\bdeluxe/i.test(name) ||
        /\bdemo/i.test(name);
      if (trackHasIndicator) {
        return true;
      }
    }
  }

  return false;
}

function extractTracks(items: unknown): SpotifyTrack[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter(isValidTrack)
    .filter((track) => !isObscureTrack(track));
}

// ─── Search for tracks ───

async function searchForTracks(
  query: string,
  token: string,
  limit = SEARCH_LIMIT,
  offset = 0
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
    offset: String(offset),
  });

  const data = (await spFetch(`/search?${params.toString()}`, token)) as Record<
    string,
    unknown
  > | null;
  if (!data) return [];

  const tracks = data.tracks as Record<string, unknown> | undefined;
  if (!tracks) return [];

  return extractTracks(tracks.items);
}

// ─── Browse: New Releases ───

async function getNewReleases(
  token: string,
  limit = SEARCH_LIMIT
): Promise<SpotifyTrack[]> {
  const data = (await spFetch(
    `/browse/new-releases?limit=${limit}`,
    token
  )) as Record<string, unknown> | null;
  if (!data) return [];

  const albums = data.albums as Record<string, unknown> | undefined;
  if (!albums) return [];

  const items = albums.items as unknown[] | undefined;
  if (!Array.isArray(items)) return [];

  // New releases gives us albums; search for tracks from each album
  const allTracks: SpotifyTrack[] = [];
  for (const album of items.slice(0, 5)) {
    if (!album || typeof album !== "object") continue;
    const a = album as Record<string, unknown>;
    const name = a.name as string | undefined;
    if (!name) continue;
    const artist =
      Array.isArray(a.artists) && a.artists.length > 0
        ? (a.artists[0] as Record<string, unknown>)?.name
        : undefined;
    const query = artist ? `${name} ${artist}` : name;
    const tracks = await searchForTracks(query, token, 3, 0);
    allTracks.push(...tracks);
  }
  return allTracks;
}

// ─── User's own saved tracks (fallback) ───

async function getUserSavedTracks(
  token: string,
  limit = SEARCH_LIMIT,
  offset = 0
): Promise<SpotifyTrack[]> {
  const data = (await spFetch(
    `/me/tracks?limit=${limit}&offset=${offset}`,
    token
  )) as Record<string, unknown> | null;
  if (!data) return [];

  const items = data.items as unknown[] | undefined;
  if (!Array.isArray(items)) return [];

  return items
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object"
    )
    .map((item) => item.track)
    .filter(isValidTrack);
}

// ─── User's top tracks (fallback) ───

async function getUserTopTracks(
  token: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  limit = SEARCH_LIMIT
): Promise<SpotifyTrack[]> {
  const data = (await spFetch(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    token
  )) as Record<string, unknown> | null;
  if (!data) return [];

  return extractTracks(data.items);
}

// ─── Genre search term database ───
// Multiple diverse queries per genre to maximize discovery.
// Includes decade-specific, artist-adjacent, and mood-based terms.

// Popularity-biased terms added to EVERY genre (prepended)
const POPULAR_PREFIXES = [
  "top hits", "greatest hits", "number one", "best songs ever", "most popular",
];

const GENRE_SEARCH_TERMS: Record<string, string[]> = {
  rock: [
    "top rock hits", "greatest rock hits", "rock number one",
    "rock anthem", "classic rock", "rock and roll hit", "best rock song",
    "rock ballad", "rock 2020", "rock 2010", "rock 2000", "rock 1990",
    "stadium rock", "arena rock", "rock guitar solo", "rock power ballad",
  ],
  pop: [
    "top pop hits", "greatest pop hits", "pop number one",
    "pop hit", "pop anthem", "pop classic", "top pop song",
    "pop 2020", "pop 2015", "pop 2010", "pop dance hit",
    "pop ballad", "pop radio hit", "pop summer hit", "catchy pop song",
  ],
  metal: [
    "heavy metal", "metal classic", "thrash metal hit", "metal anthem",
    "death metal", "power metal", "metal 2020", "metal 2010",
    "metalcore hit", "progressive metal", "nu metal hit", "metal riff",
  ],
  "hip-hop": [
    "hip hop classic", "rap hit", "best rap song", "hip hop anthem",
    "old school hip hop", "rap 2020", "rap 2015", "hip hop beat",
    "gangsta rap", "conscious rap", "trap hit", "hip hop banger",
  ],
  dance: [
    "dance hit", "dance anthem", "dance classic", "dance floor hit",
    "dance pop", "dance 2020", "dance 2015", "dance music banger",
    "dance party song", "club dance hit", "electronic dance", "house dance",
  ],
  electronic: [
    "electronic hit", "EDM anthem", "synth pop hit", "electronic classic",
    "techno hit", "house music", "trance anthem", "electronic 2020",
    "dubstep hit", "ambient electronic", "electro pop", "synth wave",
  ],
  "r-n-b": [
    "R&B classic", "R&B hit", "soul R&B", "best R&B song",
    "R&B 2020", "R&B 2010", "R&B slow jam", "neo soul",
    "R&B ballad", "contemporary R&B", "R&B groove", "smooth R&B",
  ],
  jazz: [
    "jazz classic", "jazz standard", "smooth jazz", "jazz hit",
    "bebop jazz", "jazz fusion", "vocal jazz", "jazz piano",
    "cool jazz", "jazz saxophone", "modern jazz", "jazz swing",
  ],
  classical: [
    "classical masterpiece", "famous classical", "beethoven symphony",
    "mozart concerto", "classical orchestra", "romantic era classical",
    "bach fugue", "chopin nocturne", "vivaldi four seasons", "classical piano",
  ],
  country: [
    "country hit", "country classic", "best country song", "country anthem",
    "country 2020", "country 2015", "country ballad", "country rock",
    "country pop crossover", "outlaw country", "modern country", "country love song",
  ],
  blues: [
    "blues classic", "best blues song", "blues guitar", "chicago blues",
    "delta blues", "blues rock", "electric blues", "blues ballad",
    "modern blues", "blues harmonica", "blues shuffle", "blues legend",
  ],
  reggae: [
    "reggae classic", "reggae hit", "dancehall hit", "reggae anthem",
    "roots reggae", "reggae love song", "ska hit", "dub reggae",
    "modern reggae", "reggae 2020", "island reggae", "reggae groove",
  ],
  punk: [
    "punk rock classic", "punk hit", "punk anthem", "punk rock 90s",
    "pop punk hit", "punk 2000", "hardcore punk", "punk rock banger",
    "skate punk", "punk rock anthem", "punk fast song", "punk energy",
  ],
  soul: [
    "soul classic", "soul hit", "motown classic", "soul anthem",
    "northern soul", "soul ballad", "soul 70s", "neo soul hit",
    "soul groove", "soul singer", "soul power", "funk soul",
  ],
  indie: [
    "indie rock hit", "indie classic", "indie anthem", "indie 2020",
    "indie folk", "indie pop hit", "dream pop", "shoegaze",
    "indie 2015", "lo-fi indie", "indie guitar", "indie bedroom pop",
  ],
  latin: [
    "latin hit", "reggaeton hit", "latin pop", "salsa classic",
    "bachata hit", "cumbia", "latin 2020", "latin dance",
    "merengue hit", "latin urban", "bossa nova", "latin trap",
  ],
  funk: [
    "funk classic", "funk hit", "funky music", "funk anthem",
    "funk 70s", "disco funk", "p-funk", "funk groove",
    "funk bass", "electro funk", "funk soul", "funk dance",
  ],
  disco: [
    "disco classic", "disco hit", "disco anthem", "disco 70s",
    "disco dance", "nu disco", "disco funk", "disco diva",
    "disco ball", "disco party", "disco groove", "disco fever",
  ],
  alternative: [
    "alternative rock hit", "alt rock classic", "90s alternative",
    "alternative anthem", "post punk", "new wave hit", "shoegaze",
    "alternative 2020", "alternative 2010", "alt rock anthem", "indie alternative",
    "alternative ballad",
  ],
  grunge: [
    "grunge classic", "grunge hit", "90s grunge", "seattle grunge",
    "grunge anthem", "grunge rock", "post grunge", "grunge ballad",
    "grunge guitar", "grunge 1994", "grunge alternative", "grunge angst",
  ],
};

/**
 * Build a song pool. Search-first for discovery; user library only as fallback.
 */
export async function buildSongPool(
  config: GameConfig,
  targetSize = 60
): Promise<SpotifyTrack[]> {
  const { genres } = config;

  if (genres.length === 0) {
    console.warn("[SongPool] No genres selected");
    return [];
  }

  const token = await requireToken();
  let allTracks: SpotifyTrack[] = [];

  console.log(`[SongPool] genres=[${genres.join(", ")}], target=${targetSize}`);

  // ── Strategy 1: Diverse track search (PRIMARY) ──
  console.log("[SongPool] Strategy 1: Track search (discovery)...");
  for (const genre of genres) {
    const terms = GENRE_SEARCH_TERMS[genre] ?? [
      `${genre} hit song`,
      `${genre} classic`,
      `best ${genre} songs`,
      `${genre} anthem`,
      `${genre} music`,
      `${genre} 2020`,
      `${genre} 2015`,
      `${genre} 2010`,
      `${genre} 2000`,
      `${genre} 1990`,
    ];

    // Shuffle terms so each game gets different results
    const shuffledTerms = shuffle(terms);

    for (const term of shuffledTerms) {
      if (allTracks.length >= targetSize * 2) break;

      // Random offset (0-50) for pagination diversity
      const offset = Math.floor(Math.random() * 50);
      const tracks = await searchForTracks(term, token, SEARCH_LIMIT, offset);
      if (tracks.length > 0) {
        console.log(`[SongPool]   "${term}" (offset ${offset}): ${tracks.length}`);
        allTracks.push(...tracks);
      }
    }

    // Also search the genre name directly with varying offsets
    for (let i = 0; i < 3 && allTracks.length < targetSize * 2; i++) {
      const offset = i * 10 + Math.floor(Math.random() * 10);
      const tracks = await searchForTracks(genre, token, SEARCH_LIMIT, offset);
      if (tracks.length > 0) {
        console.log(`[SongPool]   "${genre}" (page ${i}, offset ${offset}): ${tracks.length}`);
        allTracks.push(...tracks);
      }
    }
  }

  console.log(`[SongPool] After search: ${dedup(allTracks).length} unique`);

  // ── Strategy 2: Browse new releases ──
  if (dedup(allTracks).length < targetSize) {
    console.log("[SongPool] Strategy 2: New releases...");
    const newTracks = await getNewReleases(token, SEARCH_LIMIT);
    if (newTracks.length > 0) {
      console.log(`[SongPool]   New releases: ${newTracks.length}`);
      allTracks.push(...newTracks);
    }
  }

  console.log(`[SongPool] After new releases: ${dedup(allTracks).length} unique`);

  // ── Strategy 3: User's top tracks (FALLBACK only) ──
  if (dedup(allTracks).length < targetSize) {
    console.log("[SongPool] Strategy 3 (fallback): User's top tracks...");
    for (const range of ["medium_term", "long_term", "short_term"] as const) {
      const topTracks = await getUserTopTracks(token, range);
      if (topTracks.length > 0) {
        console.log(`[SongPool]   Top tracks (${range}): ${topTracks.length}`);
        allTracks.push(...topTracks);
      }
      if (dedup(allTracks).length >= targetSize) break;
    }
  }

  // ── Strategy 4: User's saved tracks (LAST RESORT) ──
  if (dedup(allTracks).length < targetSize) {
    console.log("[SongPool] Strategy 4 (last resort): Saved tracks...");
    for (
      let offset = 0;
      offset < 100 && dedup(allTracks).length < targetSize;
      offset += SEARCH_LIMIT
    ) {
      const saved = await getUserSavedTracks(token, SEARCH_LIMIT, offset);
      if (saved.length === 0) break;
      console.log(`[SongPool]   Saved (offset ${offset}): ${saved.length}`);
      allTracks.push(...saved);
    }
  }

  // ── Post-processing ──
  allTracks = dedup(allTracks);

  // Popularity bias: prefer well-known tracks players can actually guess
  const withPopularity = allTracks.filter((t) => {
    const pop = (t as Record<string, unknown>).popularity;
    return typeof pop === "number";
  });

  if (withPopularity.length > 20) {
    const popular = withPopularity.filter(
      (t) => ((t as Record<string, unknown>).popularity as number) >= 50
    );
    const mid = withPopularity.filter((t) => {
      const p = (t as Record<string, unknown>).popularity as number;
      return p >= 20 && p < 50;
    });
    const noPop = allTracks.filter((t) => {
      const pop = (t as Record<string, unknown>).popularity;
      return typeof pop !== "number";
    });

    // 70% popular, 30% mid-range, skip deep cuts (< 20)
    const popTarget = Math.floor(targetSize * 0.7);
    const midTarget = targetSize - popTarget;

    allTracks = [
      ...shuffle(popular).slice(0, popTarget),
      ...shuffle(mid).slice(0, midTarget),
      ...shuffle(noPop).slice(0, 10),
    ];

    console.log(
      `[SongPool] Popularity split: ${popular.length} popular, ${mid.length} mid, ${noPop.length} unknown`
    );
  }

  allTracks = dedup(allTracks);
  allTracks = shuffle(allTracks);
  console.log(`[SongPool] Final: ${allTracks.length} tracks`);

  return allTracks;
}
