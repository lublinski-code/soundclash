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
const PER_ARTIST_LIMIT = 10; // Keep small to maximise artist variety across the pool

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

/**
 * Non-Latin script detection: rejects songs with names primarily in
 * Hebrew, Arabic, CJK, Cyrillic, Thai, Devanagari, etc.
 * Allows accented Latin characters (French, Spanish, German, etc.)
 */
const NON_LATIN_HEAVY = /^[^a-zA-Z]*$/;
const NON_LATIN_SCRIPTS = /[\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF\u0E00-\u0E7F\u0900-\u097F]/;

function hasNonLatinName(name: string): boolean {
  if (NON_LATIN_HEAVY.test(name)) return true;
  const nonLatinChars = (name.match(NON_LATIN_SCRIPTS) || []).length;
  const totalAlpha = (name.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length;
  return nonLatinChars > totalAlpha;
}

function isValidTrack(raw: unknown): raw is SpotifyTrack {
  if (!raw || typeof raw !== "object") return false;
  const t = raw as Record<string, unknown>;
  if (
    typeof t.id !== "string" ||
    !t.id ||
    typeof t.name !== "string" ||
    typeof t.uri !== "string" ||
    typeof t.duration_ms !== "number" ||
    t.duration_ms < 15000 ||
    !Array.isArray(t.artists) ||
    t.artists.length === 0 ||
    !t.album ||
    typeof t.album !== "object"
  ) return false;

  // Reject non-Latin song names (Hebrew, Arabic, CJK, etc.)
  if (hasNonLatinName(t.name as string)) return false;

  // Reject "Various Artists" compilations
  const artists = t.artists as { name?: string }[];
  if (artists.some(a => /^various\s*artists?$/i.test(a.name ?? ""))) return false;

  // Only accept album/single, reject compilations
  const album = t.album as Record<string, unknown>;
  const albumType = album.album_type as string | undefined;
  if (albumType && albumType !== "album" && albumType !== "single") return false;

  return true;
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

  // Check album name for live/session-only indicators.
  // NOTE: Remastered albums are intentionally NOT filtered — for 80s/90s music
  // the remastered version is often the only canonical release on Spotify
  // (e.g. "Master of Puppets (Remastered)" is the standard Metallica album).
  const albumObscurePatterns = [
    /\blive\s*album/i,
    /\bcomplete\s*sessions/i,
    /\bdemos?\s*(album|collection|sessions?)\b/i,
  ];

  for (const pattern of albumObscurePatterns) {
    if (pattern.test(albumName)) {
      const trackHasIndicator = /\bbonus\s*track/i.test(name) || /\bdemo\b/i.test(name);
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
  limit = PER_ARTIST_LIMIT,
  offset = 0,
  market?: string
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
    offset: String(offset),
  });
  if (market) params.set("market", market);

  const data = (await spFetch(`/search?${params.toString()}`, token)) as Record<
    string,
    unknown
  > | null;
  if (!data) return [];

  const tracks = data.tracks as Record<string, unknown> | undefined;
  if (!tracks) return [];

  return extractTracks(tracks.items);
}


// ─── Genre search strategy ───
// Artist-only approach: curated lists of well-known acts per genre
// guarantee genre-relevant, recognizable results. Genre tag searches
// and user library fallbacks were removed because they returned
// unrelated songs (e.g. black metal in grunge, kids songs).

const GENRE_ARTISTS: Record<string, string[]> = {
  rock: [
    "Queen", "Led Zeppelin", "AC/DC", "The Rolling Stones", "Nirvana",
    "Foo Fighters", "Red Hot Chili Peppers", "U2", "Bon Jovi", "Aerosmith",
    "The Beatles", "Pink Floyd", "Guns N' Roses", "Green Day", "Coldplay",
    "Muse", "Oasis", "The Who", "Linkin Park", "Arctic Monkeys",
  ],
  pop: [
    "Taylor Swift", "Ed Sheeran", "Adele", "Bruno Mars", "Dua Lipa",
    "The Weeknd", "Billie Eilish", "Justin Bieber", "Ariana Grande", "Lady Gaga",
    "Rihanna", "Katy Perry", "Beyoncé", "Shakira", "Michael Jackson",
    "Madonna", "Olivia Rodrigo", "Harry Styles", "Doja Cat", "SZA",
  ],
  metal: [
    "Metallica", "Iron Maiden", "Black Sabbath", "Slayer", "Megadeth",
    "Pantera", "Judas Priest", "System Of A Down", "Avenged Sevenfold",
    "Tool", "Rammstein", "Slipknot", "Korn", "Disturbed", "Ozzy Osbourne",
    "Dio", "Motörhead", "Anthrax", "Alice Cooper", "Whitesnake",
    "Guns N' Roses", "Deep Purple", "Rainbow", "Accept", "Dokken",
    "Twisted Sister", "Quiet Riot", "W.A.S.P.", "Warrant", "Scorpions",
    "Def Leppard", "Bon Jovi", "Mötley Crüe", "Poison", "Cinderella",
    "Sepultura", "Machine Head", "Fear Factory", "Rage Against the Machine",
    "Faith No More", "Alice In Chains", "Soundgarden", "Type O Negative",
    "Testament", "Exodus", "Death", "Cannibal Corpse", "Queensrÿche",
  ],
  "hip-hop": [
    "Eminem", "Kendrick Lamar", "Drake", "Jay-Z", "Kanye West",
    "Tupac", "Notorious B.I.G.", "Snoop Dogg", "Travis Scott", "J. Cole",
    "Nas", "Lil Wayne", "50 Cent", "Post Malone", "Dr. Dre",
    "OutKast", "Nicki Minaj", "Cardi B", "Tyler, The Creator", "A$AP Rocky",
  ],
  dance: [
    "Calvin Harris", "David Guetta", "Avicii", "Tiësto", "Marshmello",
    "Martin Garrix", "Kygo", "Zedd", "The Chainsmokers", "Major Lazer",
    "Clean Bandit", "Disclosure", "Daft Punk", "Robin Schulz", "Joel Corry",
  ],
  electronic: [
    "Daft Punk", "Deadmau5", "Skrillex", "Aphex Twin", "The Prodigy",
    "Chemical Brothers", "Kraftwerk", "Depeche Mode", "Fatboy Slim", "Moby",
    "Flume", "ODESZA", "Bonobo", "Justice", "Caribou",
  ],
  "r-n-b": [
    "Usher", "Alicia Keys", "Frank Ocean", "The Weeknd", "SZA",
    "Beyoncé", "Chris Brown", "Ne-Yo", "John Legend", "H.E.R.",
    "Miguel", "Khalid", "Daniel Caesar", "Lauryn Hill", "Mary J. Blige",
    "Whitney Houston", "Marvin Gaye", "Stevie Wonder", "D'Angelo", "TLC",
  ],
  jazz: [
    "Miles Davis", "John Coltrane", "Louis Armstrong", "Duke Ellington",
    "Ella Fitzgerald", "Billie Holiday", "Charlie Parker", "Thelonious Monk",
    "Dave Brubeck", "Nina Simone", "Herbie Hancock", "Chet Baker",
  ],
  classical: [
    "Beethoven", "Mozart", "Bach", "Chopin", "Vivaldi",
    "Tchaikovsky", "Debussy", "Schubert", "Brahms", "Dvořák",
  ],
  country: [
    "Johnny Cash", "Dolly Parton", "Luke Combs", "Morgan Wallen",
    "Carrie Underwood", "Blake Shelton", "Keith Urban", "Tim McGraw",
    "Shania Twain", "Willie Nelson", "Chris Stapleton", "Zach Bryan",
    "Jason Aldean", "Kenny Chesney", "George Strait",
  ],
  blues: [
    "B.B. King", "Muddy Waters", "Stevie Ray Vaughan", "Robert Johnson",
    "Howlin' Wolf", "Eric Clapton", "John Lee Hooker", "Buddy Guy",
    "Etta James", "Albert King", "Keb' Mo'", "Joe Bonamassa",
  ],
  reggae: [
    "Bob Marley", "Peter Tosh", "Jimmy Cliff", "UB40", "Sean Paul",
    "Damian Marley", "Shaggy", "Ziggy Marley", "Buju Banton", "Lee Perry",
  ],
  punk: [
    "The Ramones", "Sex Pistols", "The Clash", "Green Day", "Blink-182",
    "The Offspring", "Bad Religion", "NOFX", "Sum 41", "Misfits",
    "Dead Kennedys", "Rancid", "Rise Against", "Pennywise", "Social Distortion",
  ],
  soul: [
    "Aretha Franklin", "Marvin Gaye", "Stevie Wonder", "Ray Charles",
    "James Brown", "Otis Redding", "Al Green", "Sam Cooke",
    "Curtis Mayfield", "Bill Withers", "Isaac Hayes", "Leon Bridges",
  ],
  indie: [
    "Arctic Monkeys", "Tame Impala", "Radiohead", "The Strokes",
    "Vampire Weekend", "The National", "Bon Iver", "Fleet Foxes",
    "Mac DeMarco", "Arcade Fire", "Phoebe Bridgers", "Beach House",
    "The XX", "Modest Mouse", "The Smiths",
  ],
  latin: [
    "Bad Bunny", "J Balvin", "Shakira", "Daddy Yankee", "Ozuna",
    "Maluma", "Rosalía", "Luis Fonsi", "Enrique Iglesias", "Ricky Martin",
    "Marc Anthony", "Juanes", "Karol G", "Rauw Alejandro", "Nicky Jam",
  ],
  funk: [
    "James Brown", "Parliament", "Funkadelic", "Earth Wind & Fire",
    "Sly and the Family Stone", "Prince", "Rick James", "Bootsy Collins",
    "Tower of Power", "The Meters", "Kool & The Gang", "Chic",
  ],
  disco: [
    "Bee Gees", "Donna Summer", "Gloria Gaynor", "ABBA", "Chic",
    "KC and the Sunshine Band", "Village People", "Kool & The Gang",
    "Earth Wind & Fire", "Diana Ross", "Daft Punk", "Kylie Minogue",
  ],
  alternative: [
    "Radiohead", "R.E.M.", "The Cure", "Depeche Mode", "The Smiths",
    "Pixies", "Joy Division", "New Order", "Talking Heads", "Blur",
    "Beck", "Cage The Elephant", "alt-J", "Gorillaz", "Placebo",
  ],
  grunge: [
    "Nirvana", "Pearl Jam", "Soundgarden", "Alice In Chains",
    "Stone Temple Pilots", "Mudhoney", "Screaming Trees", "Temple of the Dog",
    "Bush", "Silverchair", "Hole", "Smashing Pumpkins",
  ],
};


/**
 * Build a year filter string for Spotify search (e.g. "year:1990-1999").
 * When multiple eras are selected, returns the widest range spanning all of them.
 */
function buildYearFilter(eras: string[]): string {
  if (!eras || eras.length === 0) return "";
  const starts = eras.map(e => parseInt(e, 10)).filter(n => !isNaN(n));
  if (starts.length === 0) return "";
  const min = Math.min(...starts);
  const max = Math.max(...starts) + 9;
  return ` year:${min}-${max}`;
}

/**
 * Build a song pool from curated artist lists only.
 * No user library fallbacks — avoids unrelated songs leaking in.
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

  const token = await requireToken();
  let allTracks: SpotifyTrack[] = [];
  const yearFilter = buildYearFilter(eras);

  console.log(`[SongPool] genres=[${genres.join(", ")}], eras=[${(eras ?? []).join(", ")}], market=${market}, target=${targetSize}`);
  if (yearFilter) console.log(`[SongPool] Year filter:${yearFilter}`);

  // ── Artist-based search ──
  // Strategy: query MANY artists with FEW tracks each to maximise variety.
  // Never break early — always search all available artists for the genre.
  for (const genre of genres) {
    const artists = GENRE_ARTISTS[genre] ?? [];
    const shuffledArtists = shuffle(artists);

    for (const artist of shuffledArtists) {
      const offset = Math.floor(Math.random() * 5);
      const query = `artist:${artist}${yearFilter}`;
      const tracks = await searchForTracks(query, token, PER_ARTIST_LIMIT, offset, market);

      // Verify results actually belong to the queried artist — Spotify's
      // fuzzy matching can return unrelated artists (e.g. "Death" → classical).
      const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
      const verified = tracks.filter((t) => {
        const trackArtists = t.artists as { name?: string }[];
        return trackArtists.some((a) => {
          const normalA = (a.name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return normalA.includes(normalQ) || normalQ.includes(normalA);
        });
      });

      if (verified.length > 0) {
        console.log(`[SongPool]   "${artist}" (offset ${offset}): ${verified.length} tracks`);
        allTracks.push(...verified);
      }
    }
  }

  console.log(`[SongPool] After artist search: ${dedup(allTracks).length} unique`);

  // ── Post-processing ──
  allTracks = dedup(allTracks);

  // Lower the popularity floor when eras are selected — classic 80s/90s
  // tracks often score 20-35 on Spotify despite being well-known hits.
  const popularityFloor = yearFilter ? 15 : 30;

  const withPopularity = allTracks.filter((t) => {
    const pop = (t as Record<string, unknown>).popularity;
    return typeof pop === "number" && pop >= popularityFloor;
  });

  if (withPopularity.length >= 20) {
    allTracks = withPopularity;
    console.log(`[SongPool] After popularity filter (>= ${popularityFloor}): ${allTracks.length}`);
  } else {
    console.warn(`[SongPool] Only ${withPopularity.length} tracks above popularity floor, keeping all ${allTracks.length}`);
  }

  // ── Artist-diversity cap ──
  // No single artist should dominate the pool. Cap at ~4 tracks per artist
  // so the game feels like a broad genre quiz, not a single-band quiz.
  const maxPerArtist = Math.max(4, Math.ceil(targetSize / 12));
  const artistCount: Record<string, number> = {};
  allTracks = shuffle(allTracks).filter((t) => {
    const mainArtist = (t.artists as { name?: string }[])[0]?.name ?? "unknown";
    artistCount[mainArtist] = (artistCount[mainArtist] ?? 0) + 1;
    return artistCount[mainArtist] <= maxPerArtist;
  });

  const uniqueArtists = Object.keys(artistCount).filter((a) => artistCount[a] > 0);
  console.log(`[SongPool] After diversity cap (max ${maxPerArtist}/artist): ${allTracks.length} tracks from ${uniqueArtists.length} artists`);

  // Final trim to target size
  allTracks = shuffle(allTracks).slice(0, targetSize);
  console.log(`[SongPool] Final: ${allTracks.length} tracks`);

  return allTracks;
}
