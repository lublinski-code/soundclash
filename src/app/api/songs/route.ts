import { NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify/clientToken";

const BASE = "https://api.spotify.com/v1";

const ERA_PLAYLISTS: Record<string, string> = {
  "1980": "37i9dQZF1DX4UtSsGT1Sbe", // All Out 80s
  "1990": "37i9dQZF1DXbTxeAdrVG2l", // All Out 90s
  "2000": "37i9dQZF1DX4o1oenSJRJd", // All Out 00s
  "2010": "37i9dQZF1DX5Ejj0EkURtP", // All Out 10s
};

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

const OBSCURE_PATTERNS = [
  /\bdemo\b/i, /\bdemos\b/i, /\brare\b/i, /\bouttake/i,
  /\balternate\s*take/i, /\brough\s*mix/i,
  /\blive\b/i, /\blive\s*at\b/i, /\blive\s*from\b/i,
  /\bunplugged/i, /\bacoustic\s*version/i,
  /\bcommentary\b/i, /\binterlude\b/i, /\bintro\b/i, /\boutro\b/i, /\bskit\b/i,
  /\bcover\b/i, /\bkaraoke/i, /\binstrumental\b/i,
  /\btribute\s*to\b/i,
  /\bbonus\s*track/i, /\bhidden\s*track/i,
  /\bremix(?!.*radio)/i, /\bdub\s*mix/i, /\bclub\s*mix/i, /\bextended\s*mix/i,
  /\bmedley\b/i, /\bmashup/i,
];

const NON_LATIN_SCRIPTS = /[\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0400-\u04FF\u0E00-\u0E7F\u0900-\u097F]/;

type RawTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    album_type?: string;
    images: { url: string; width: number; height: number }[];
  };
  uri: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls?: { spotify?: string };
};

async function spFetch<T>(endpoint: string, token: string): Promise<T | null> {
  const resp = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    console.warn(`[API/songs] ${resp.status} on ${endpoint.split("?")[0]}`);
    return null;
  }
  return resp.json();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidTrack(t: RawTrack, popularityFloor: number): boolean {
  if (!t.id || !t.name || !t.uri || t.duration_ms < 15_000) return false;
  if (!t.artists?.length || !t.album) return false;

  if (t.popularity < popularityFloor) return false;

  const albumType = t.album.album_type;
  if (albumType && albumType !== "album" && albumType !== "single") return false;

  if (t.artists.some(a => /^various\s*artists?$/i.test(a.name))) return false;

  const nonLatin = (t.name.match(NON_LATIN_SCRIPTS) || []).length;
  const latin = (t.name.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length;
  if (nonLatin > latin) return false;

  for (const pat of OBSCURE_PATTERNS) {
    if (pat.test(t.name)) return false;
  }

  return true;
}

function buildYearFilter(eras: string[]): string {
  if (!eras?.length) return "";
  const starts = eras.map(e => parseInt(e, 10)).filter(n => !isNaN(n));
  if (!starts.length) return "";
  return ` year:${Math.min(...starts)}-${Math.max(...starts) + 9}`;
}

async function fetchPlaylistTracks(
  playlistId: string,
  token: string,
  market: string
): Promise<RawTrack[]> {
  const tracks: RawTrack[] = [];
  let offset = 0;
  const limit = 50;

  while (offset < 200) {
    const data = await spFetch<{
      items: { track: RawTrack }[];
      total: number;
    }>(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&market=${market}&fields=items(track(id,name,artists(id,name),album(id,name,album_type,images),uri,duration_ms,popularity,preview_url,external_urls)),total`, token);

    if (!data?.items) break;
    for (const item of data.items) {
      if (item.track) tracks.push(item.track);
    }
    if (offset + limit >= data.total) break;
    offset += limit;
  }

  return tracks;
}

async function searchForTracks(
  query: string,
  token: string,
  limit: number,
  offset: number,
  market?: string
): Promise<RawTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
    offset: String(offset),
  });
  if (market) params.set("market", market);

  const data = await spFetch<{ tracks?: { items: RawTrack[] } }>(
    `/search?${params}`,
    token
  );
  return data?.tracks?.items ?? [];
}

/**
 * Batch-fetch preview_url for track IDs using the provided Spotify token.
 * Returns a map of trackId → previewUrl.
 */
async function batchFetchSpotifyPreviews(
  trackIds: string[],
  token: string,
  market: string
): Promise<Map<string, string>> {
  const previews = new Map<string, string>();
  const batchSize = 50;

  for (let i = 0; i < trackIds.length; i += batchSize) {
    const batch = trackIds.slice(i, i + batchSize);
    const data = await spFetch<{ tracks: (RawTrack | null)[] }>(
      `/tracks?ids=${batch.join(",")}&market=${market}`,
      token
    );
    for (const track of data?.tracks ?? []) {
      if (track?.id && track.preview_url) {
        previews.set(track.id, track.preview_url);
      }
    }
  }

  return previews;
}

type ItunesResult = { artistName: string; trackName: string; previewUrl?: string };

/**
 * Fetch iTunes Search results for an artist name.
 * iTunes provides free 30-second previews with no auth.
 */
async function fetchItunesForArtist(artistName: string): Promise<ItunesResult[]> {
  try {
    const resp = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&media=music&entity=song&limit=50`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

/**
 * For tracks missing a preview URL, query iTunes by artist and match by track name.
 * Groups by primary artist to minimise API calls.
 */
async function enrichWithItunesPreviews(tracks: RawTrack[]): Promise<Map<string, string>> {
  const previewMap = new Map<string, string>();

  // Group by primary artist
  const artistGroups = new Map<string, RawTrack[]>();
  for (const track of tracks) {
    const artist = track.artists[0]?.name ?? "";
    if (!artistGroups.has(artist)) artistGroups.set(artist, []);
    artistGroups.get(artist)!.push(track);
  }

  // Parallel iTunes searches — one per unique artist
  await Promise.all(
    [...artistGroups.entries()].map(async ([artistName, artistTracks]) => {
      const results = await fetchItunesForArtist(artistName);
      for (const track of artistTracks) {
        const normTrack = track.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const match = results.find(r => {
          if (!r.previewUrl) return false;
          const normItunes = r.trackName.toLowerCase().replace(/[^a-z0-9]/g, "");
          return normItunes === normTrack || normItunes.startsWith(normTrack) || normTrack.startsWith(normItunes);
        });
        if (match?.previewUrl) {
          previewMap.set(track.id, match.previewUrl);
        }
      }
    })
  );

  return previewMap;
}

export async function POST(request: Request) {
  try {
    const { genres, eras, market, userToken } = (await request.json()) as {
      genres: string[];
      eras: string[];
      market: string;
      userToken?: string;
    };

    if (!genres?.length) {
      return NextResponse.json({ error: "No genres provided" }, { status: 400 });
    }

    const ccToken = await getClientCredentialsToken();
    const mkt = market || "US";
    const yearFilter = buildYearFilter(eras);
    const popularityFloor = yearFilter ? 15 : 65;

    let allTracks: RawTrack[] = [];

    // Strategy 1: curated era playlists
    if (eras?.length) {
      for (const era of eras) {
        const playlistId = ERA_PLAYLISTS[era];
        if (playlistId) {
          const tracks = await fetchPlaylistTracks(playlistId, ccToken, mkt);
          allTracks.push(...tracks);
        }
      }
    }

    // Strategy 2: artist-based search (always run as primary or fallback)
    for (const genre of genres) {
      const artists = GENRE_ARTISTS[genre] ?? [];
      const shuffled = shuffle(artists);

      for (const artist of shuffled) {
        const offset = Math.floor(Math.random() * 5);
        const query = `artist:${artist}${yearFilter}`;
        const tracks = await searchForTracks(query, ccToken, 10, offset, mkt);

        const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
        const verified = tracks.filter(t =>
          t.artists.some(a => {
            const normalA = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
            return normalA.includes(normalQ) || normalQ.includes(normalA);
          })
        );
        allTracks.push(...verified);
      }
    }

    // Dedup
    const seen = new Set<string>();
    allTracks = allTracks.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    // Filter
    allTracks = allTracks.filter(t => isValidTrack(t, popularityFloor));

    // Artist diversity cap
    const maxPerArtist = 4;
    const artistCount: Record<string, number> = {};
    allTracks = shuffle(allTracks).filter(t => {
      const mainArtist = t.artists[0]?.name ?? "unknown";
      artistCount[mainArtist] = (artistCount[mainArtist] ?? 0) + 1;
      return artistCount[mainArtist] <= maxPerArtist;
    });

    // Trim to 200 candidates
    allTracks = shuffle(allTracks).slice(0, 200);

    // Layer 1: user token batch fetch (most reliable for Spotify preview_url)
    let previewMap = new Map<string, string>();
    if (userToken) {
      previewMap = await batchFetchSpotifyPreviews(allTracks.map(t => t.id), userToken, mkt);
      console.log(`[API/songs] Spotify user-token previews: ${previewMap.size}/${allTracks.length}`);
    }

    // Layer 2: CC token preview_url already embedded in search/playlist results
    for (const t of allTracks) {
      if (!previewMap.has(t.id) && t.preview_url) {
        previewMap.set(t.id, t.preview_url);
      }
    }
    console.log(`[API/songs] After Spotify CC fallback: ${previewMap.size}/${allTracks.length}`);

    // Layer 3: iTunes Search API — free, no auth, reliable 30s previews
    const missingPreviews = allTracks.filter(t => !previewMap.has(t.id));
    if (missingPreviews.length > 0) {
      const itunesPreviews = await enrichWithItunesPreviews(missingPreviews);
      console.log(`[API/songs] iTunes previews found: ${itunesPreviews.size}/${missingPreviews.length}`);
      for (const [id, url] of itunesPreviews) {
        previewMap.set(id, url);
      }
    }

    console.log(`[API/songs] Total tracks with previews: ${previewMap.size}/${allTracks.length}`);

    const result = allTracks
      .filter(t => previewMap.has(t.id))
      .map(t => ({
        id: t.id,
        name: t.name,
        artists: t.artists.map(a => ({ id: a.id, name: a.name })),
        album: {
          id: t.album.id,
          name: t.album.name,
          images: t.album.images,
        },
        uri: t.uri,
        duration_ms: t.duration_ms,
        previewUrl: previewMap.get(t.id) as string,
        spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
      }));

    return NextResponse.json({ tracks: result });
  } catch (err) {
    console.error("[API/songs] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
