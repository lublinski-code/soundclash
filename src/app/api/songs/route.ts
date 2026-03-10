import { NextResponse } from "next/server";
import { getClientCredentialsToken } from "@/lib/spotify/clientToken";

const BASE = "https://api.spotify.com/v1";

// Spotify genre tags for search queries — these map to Spotify's internal genre taxonomy
const GENRE_SEARCH_TAGS: Record<string, string[]> = {
  rock: ["rock", "classic rock", "hard rock", "arena rock", "album rock"],
  pop: ["pop", "dance pop", "synthpop", "europop", "pop rock"],
  metal: ["metal", "heavy metal", "thrash metal", "hard rock", "glam metal"],
  "hip-hop": ["hip hop", "rap", "gangsta rap", "east coast hip hop", "west coast hip hop"],
  dance: ["dance", "edm", "house", "dance pop", "eurodance"],
  electronic: ["electronic", "electro", "synthwave", "new wave", "industrial"],
  "r-n-b": ["r&b", "urban contemporary", "new jack swing", "soul", "quiet storm"],
  jazz: ["jazz", "smooth jazz", "vocal jazz", "bebop", "cool jazz"],
  classical: ["classical", "romantic era", "baroque", "classical performance"],
  country: ["country", "classic country", "country rock", "outlaw country"],
  blues: ["blues", "electric blues", "blues rock", "soul blues"],
  reggae: ["reggae", "roots reggae", "dancehall", "ska"],
  punk: ["punk", "punk rock", "pop punk", "hardcore punk", "skate punk"],
  soul: ["soul", "motown", "northern soul", "southern soul", "neo soul"],
  indie: ["indie rock", "indie pop", "indie", "alternative", "shoegaze"],
  latin: ["latin", "reggaeton", "latin pop", "salsa", "bachata"],
  funk: ["funk", "p funk", "soul", "boogie"],
  disco: ["disco", "funk", "dance", "hi-nrg"],
  alternative: ["alternative", "alternative rock", "post-punk", "new wave", "britpop"],
  grunge: ["grunge", "alternative rock", "post-grunge", "seattle"],
};

const GENRE_ARTISTS: Record<string, string[]> = {
  rock: [
    "Queen", "Led Zeppelin", "AC/DC", "The Rolling Stones", "Nirvana",
    "Foo Fighters", "Red Hot Chili Peppers", "U2", "Bon Jovi", "Aerosmith",
    "The Beatles", "Pink Floyd", "Guns N' Roses", "Green Day", "Coldplay",
    "Muse", "Oasis", "The Who", "Linkin Park", "Arctic Monkeys",
    "Journey", "Def Leppard", "Van Halen", "Scorpions", "Foreigner",
    "Dire Straits", "Bryan Adams", "ZZ Top", "Heart", "Pat Benatar",
    "Toto", "REO Speedwagon", "Whitesnake", "Boston", "Styx",
    "The Police", "Tom Petty", "Bruce Springsteen", "Billy Joel", "Fleetwood Mac",
    "Pearl Jam", "Weezer", "Smashing Pumpkins", "Stone Temple Pilots",
    "Creed", "3 Doors Down", "Nickelback", "The Killers", "Kings of Leon",
    "Imagine Dragons", "Twenty One Pilots", "Fall Out Boy", "Paramore",
  ],
  pop: [
    "Taylor Swift", "Ed Sheeran", "Adele", "Bruno Mars", "Dua Lipa",
    "The Weeknd", "Billie Eilish", "Justin Bieber", "Ariana Grande", "Lady Gaga",
    "Rihanna", "Katy Perry", "Beyoncé", "Shakira", "Michael Jackson",
    "Madonna", "Olivia Rodrigo", "Harry Styles", "Doja Cat", "SZA",
    "Prince", "Whitney Houston", "George Michael", "Phil Collins", "Cyndi Lauper",
    "Duran Duran", "a-ha", "Tears for Fears", "Eurythmics", "Wham!",
    "Lionel Richie", "Culture Club", "Hall & Oates", "Rick Astley", "Pet Shop Boys",
    "Backstreet Boys", "NSYNC", "Spice Girls", "TLC", "Britney Spears",
    "Christina Aguilera", "Mariah Carey", "Celine Dion", "Alanis Morissette",
    "Amy Winehouse", "Lorde", "Miley Cyrus", "Sia", "Sam Smith",
    "Elton John", "Robbie Williams", "Coldplay", "OneRepublic",
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
    "Run-D.M.C.", "Beastie Boys", "N.W.A", "LL Cool J", "Public Enemy",
    "Wu-Tang Clan", "A Tribe Called Quest", "De La Soul", "Ice Cube", "DMX",
    "Missy Elliott", "Lauryn Hill", "Busta Rhymes", "Method Man",
  ],
  dance: [
    "Calvin Harris", "David Guetta", "Avicii", "Tiësto", "Marshmello",
    "Martin Garrix", "Kygo", "Zedd", "The Chainsmokers", "Major Lazer",
    "Clean Bandit", "Disclosure", "Daft Punk", "Robin Schulz", "Joel Corry",
    "Swedish House Mafia", "Armin van Buuren", "Alesso", "Diplo", "DJ Snake",
  ],
  electronic: [
    "Daft Punk", "Deadmau5", "Skrillex", "Aphex Twin", "The Prodigy",
    "Chemical Brothers", "Kraftwerk", "Depeche Mode", "Fatboy Slim", "Moby",
    "Flume", "ODESZA", "Bonobo", "Justice", "Caribou",
    "New Order", "Pet Shop Boys", "Erasure", "Gary Numan", "Orbital",
  ],
  "r-n-b": [
    "Usher", "Alicia Keys", "Frank Ocean", "The Weeknd", "SZA",
    "Beyoncé", "Chris Brown", "Ne-Yo", "John Legend", "H.E.R.",
    "Miguel", "Khalid", "Daniel Caesar", "Lauryn Hill", "Mary J. Blige",
    "Whitney Houston", "Marvin Gaye", "Stevie Wonder", "D'Angelo", "TLC",
    "Boyz II Men", "R. Kelly", "Aaliyah", "Toni Braxton", "Janet Jackson",
    "Luther Vandross", "Anita Baker", "Bobby Brown", "New Edition",
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
    "Garth Brooks", "Alan Jackson", "Reba McEntire", "Hank Williams",
    "Brooks & Dunn", "Toby Keith", "Brad Paisley", "Alabama",
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
    "Tina Turner", "Diana Ross", "Gladys Knight", "Smokey Robinson",
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
    "Nine Inch Nails", "The Cranberries", "Garbage", "Sonic Youth", "Bjork",
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
  try {
    const resp = await fetch(`${BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (resp.status === 401) {
      throw new Error("Spotify token expired or invalid");
    }
    if (resp.status === 429) {
      console.warn(`[API/songs] Rate limited on ${endpoint.split("?")[0]}`);
      const retryAfter = resp.headers.get("Retry-After");
      if (retryAfter) {
        await new Promise(r => setTimeout(r, Math.min(parseInt(retryAfter) * 1000, 3000)));
      }
      return null;
    }
    if (!resp.ok) {
      console.warn(`[API/songs] ${resp.status} on ${endpoint.split("?")[0]}`);
      return null;
    }
    return resp.json();
  } catch (err) {
    if (err instanceof Error && err.message.includes("expired")) throw err;
    console.warn(`[API/songs] Fetch error on ${endpoint.split("?")[0]}:`, err);
    return null;
  }
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

/**
 * Use Spotify's recommendations endpoint to find tracks seeded by artist IDs.
 * Returns up to `limit` tracks. This is the best way to discover genre-appropriate
 * tracks that Spotify itself considers related.
 */
async function fetchRecommendations(
  seedArtistIds: string[],
  token: string,
  limit: number,
  market: string,
  minPopularity: number
): Promise<RawTrack[]> {
  const params = new URLSearchParams({
    seed_artists: seedArtistIds.slice(0, 5).join(","),
    limit: String(Math.min(limit, 100)),
    market,
    min_popularity: String(minPopularity),
  });
  const data = await spFetch<{ tracks: RawTrack[] }>(
    `/recommendations?${params}`,
    token
  );
  return data?.tracks ?? [];
}

/**
 * Look up a Spotify artist ID by name.
 */
async function resolveArtistId(
  name: string,
  token: string,
  market?: string
): Promise<string | null> {
  const params = new URLSearchParams({ q: name, type: "artist", limit: "1" });
  if (market) params.set("market", market);
  const data = await spFetch<{ artists?: { items: { id: string; name: string }[] } }>(
    `/search?${params}`,
    token
  );
  const items = data?.artists?.items;
  if (!items?.length) return null;
  const normalQ = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalA = items[0].name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalA.includes(normalQ) || normalQ.includes(normalA)) return items[0].id;
  return null;
}

type ItunesResult = { artistName: string; trackName: string; previewUrl?: string };

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

async function enrichWithItunesPreviews(tracks: RawTrack[]): Promise<Map<string, string>> {
  const previewMap = new Map<string, string>();

  const artistGroups = new Map<string, RawTrack[]>();
  for (const track of tracks) {
    const artist = track.artists[0]?.name ?? "";
    if (!artistGroups.has(artist)) artistGroups.set(artist, []);
    artistGroups.get(artist)!.push(track);
  }

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

function toResponseTrack(t: RawTrack, previewUrl: string) {
  return {
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
    previewUrl,
    spotifyUrl: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
  };
}

function dedupTracks(tracks: RawTrack[]): RawTrack[] {
  const seen = new Set<string>();
  return tracks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/**
 * Multi-strategy song fetching pipeline — genre-first, artist-enriched.
 *
 * Order matters: Spotify's genre tag search is the most reliable broad source.
 * Artist lists are used as enrichment, not as the primary source.
 */
async function gatherTracks(
  genres: string[],
  eras: string[],
  market: string,
  token: string,
  excludeIds: Set<string>
): Promise<RawTrack[]> {
  const yearFilter = buildYearFilter(eras);
  const popularityFloor = yearFilter ? 30 : 50;
  const MIN_POOL = 40;

  let allTracks: RawTrack[] = [];

  // ── Strategy 1: Genre tag search (broad, reliable) ──
  // This is the primary source. Spotify's own genre taxonomy returns popular,
  // well-known tracks without needing a hardcoded artist list.
  {
    const searches: Promise<RawTrack[]>[] = [];
    for (const genre of genres) {
      const tags = GENRE_SEARCH_TAGS[genre] ?? [genre];
      for (const tag of shuffle(tags).slice(0, 3)) {
        for (let offset = 0; offset < 100; offset += 50) {
          searches.push(searchForTracks(`genre:"${tag}"${yearFilter}`, token, 50, offset, market));
        }
        if (yearFilter) {
          searches.push(searchForTracks(`genre:"${tag}"`, token, 50, 0, market));
        }
      }
    }
    const results = await Promise.all(searches);
    allTracks.push(...results.flat());
  }
  allTracks = dedupTracks(allTracks).filter(t => !excludeIds.has(t.id) && isValidTrack(t, popularityFloor));
  console.log(`[API/songs] Strategy 1 (genre tags): ${allTracks.length} tracks`);

  // ── Strategy 2: Artist-based search (enrichment, parallelized) ──
  {
    const searches: Promise<RawTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []);
      for (const artist of artists) {
        const query = `artist:${artist}${yearFilter}`;
        const offset = Math.floor(Math.random() * 5);
        const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
        searches.push(
          searchForTracks(query, token, 20, offset, market).then(tracks =>
            tracks.filter(t =>
              t.artists.some(a => {
                const normalA = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                return normalA.includes(normalQ) || normalQ.includes(normalA);
              })
            )
          )
        );
      }
    }
    const results = await Promise.all(searches);
    allTracks.push(...results.flat());
  }
  allTracks = dedupTracks(allTracks).filter(t => !excludeIds.has(t.id) && isValidTrack(t, popularityFloor));
  console.log(`[API/songs] Strategy 2 (artist search): ${allTracks.length} tracks`);

  // ── Strategy 4: Spotify Recommendations API ──
  if (allTracks.length < MIN_POOL) {
    const artistIds: string[] = [];
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 5);
      const resolved = await Promise.all(artists.map(a => resolveArtistId(a, token, market)));
      artistIds.push(...resolved.filter((id): id is string => id !== null));
    }
    if (artistIds.length > 0) {
      for (let i = 0; i < artistIds.length; i += 5) {
        const seeds = artistIds.slice(i, i + 5);
        const recs = await fetchRecommendations(seeds, token, 100, market, popularityFloor);
        allTracks.push(...recs);
      }
      allTracks = dedupTracks(allTracks).filter(t => !excludeIds.has(t.id) && isValidTrack(t, popularityFloor));
      console.log(`[API/songs] Strategy 4 (recommendations): ${allTracks.length} tracks`);
    }
  }

  // ── Strategy 5: Artist search WITHOUT year filter ──
  if (allTracks.length < MIN_POOL && yearFilter) {
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []);
      for (const artist of artists) {
        if (allTracks.length >= MIN_POOL * 2) break;
        const query = `artist:${artist}`;
        const tracks = await searchForTracks(query, token, 20, 0, market);
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
    allTracks = dedupTracks(allTracks).filter(t => !excludeIds.has(t.id) && isValidTrack(t, popularityFloor));
    console.log(`[API/songs] Strategy 5 (artists, no year): ${allTracks.length} tracks`);
  }

  // Artist diversity cap — keep up to 4 tracks per artist
  const artistCount: Record<string, number> = {};
  allTracks = shuffle(allTracks).filter(t => {
    const mainArtist = t.artists[0]?.name ?? "unknown";
    artistCount[mainArtist] = (artistCount[mainArtist] ?? 0) + 1;
    return artistCount[mainArtist] <= 4;
  });

  // Sort by popularity, keep top 200
  allTracks = allTracks
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 200);

  return allTracks;
}

async function resolvePreviews(
  tracks: RawTrack[],
  userToken: string | undefined,
  market: string
): Promise<Map<string, string>> {
  let previewMap = new Map<string, string>();

  if (userToken) {
    previewMap = await batchFetchSpotifyPreviews(tracks.map(t => t.id), userToken, market);
    console.log(`[API/songs] User-token previews: ${previewMap.size}/${tracks.length}`);
  }

  for (const t of tracks) {
    if (!previewMap.has(t.id) && t.preview_url) {
      previewMap.set(t.id, t.preview_url);
    }
  }

  const missing = tracks.filter(t => !previewMap.has(t.id));
  if (missing.length > 0) {
    const itunesPreviews = await enrichWithItunesPreviews(missing);
    console.log(`[API/songs] iTunes previews: ${itunesPreviews.size}/${missing.length}`);
    for (const [id, url] of itunesPreviews) {
      previewMap.set(id, url);
    }
  }

  console.log(`[API/songs] Total with previews: ${previewMap.size}/${tracks.length}`);
  return previewMap;
}

/**
 * Quick mode: genre-first search with user token preview resolution.
 *
 * Previous approach failed because:
 * - CC tokens return preview_url: null for most tracks
 * - Quick fetch never sent the user token for batch preview resolution
 * - So even when searches found 100+ tracks, all had null previews → 0 results
 *
 * Fix: pass user token through, use batchFetchSpotifyPreviews (same as full pipeline).
 */
async function handleQuickFetch(
  genres: string[],
  eras: string[],
  market: string,
  quickCount: number,
  userToken?: string
) {
  const ccToken = await getClientCredentialsToken();
  const yearFilter = buildYearFilter(eras);
  const popularityFloor = yearFilter ? 30 : 40;

  console.log(`[API/songs] Quick fetch: genres=[${genres}], eras=[${eras}], floor=${popularityFloor}, hasUserToken=${!!userToken}`);

  // ── Genre-first: broad Spotify search by genre tag (most reliable) ──
  const genreSearches: Promise<RawTrack[]>[] = [];
  for (const genre of genres) {
    const tags = GENRE_SEARCH_TAGS[genre] ?? [genre];
    for (const tag of shuffle(tags).slice(0, 3)) {
      genreSearches.push(
        searchForTracks(`genre:"${tag}"${yearFilter}`, ccToken, 50, 0, market)
      );
      if (yearFilter) {
        genreSearches.push(
          searchForTracks(`genre:"${tag}"`, ccToken, 50, 0, market)
        );
      }
    }
  }

  // ── Artist searches in parallel (enrichment) ──
  const artistSearches: Promise<RawTrack[]>[] = [];
  for (const genre of genres) {
    const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 8);
    for (const artist of artists) {
      const query = `artist:${artist}${yearFilter}`;
      const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
      artistSearches.push(
        searchForTracks(query, ccToken, 10, 0, market).then(tracks =>
          tracks.filter(t =>
            t.artists.some(a => {
              const normalA = a.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              return normalA.includes(normalQ) || normalQ.includes(normalA);
            })
          )
        )
      );
    }
  }

  const [genreResults, artistResults] = await Promise.all([
    Promise.all(genreSearches),
    Promise.all(artistSearches),
  ]);

  let candidates = [
    ...genreResults.flat(),
    ...artistResults.flat(),
  ];

  candidates = dedupTracks(candidates).filter(t => isValidTrack(t, popularityFloor));
  console.log(`[API/songs] Quick mode: ${candidates.length} candidates after filter`);

  // Sort by popularity, keep top 60 for preview resolution
  candidates = candidates.sort((a, b) => b.popularity - a.popularity).slice(0, 60);

  // ── Resolve previews using the SAME approach as full pipeline ──
  const previewMap = await resolvePreviews(candidates, userToken, market);

  const withPreviews = candidates.filter(t => previewMap.has(t.id));
  console.log(`[API/songs] Quick mode: ${withPreviews.length} with previews from ${candidates.length} candidates`);

  const result = shuffle(withPreviews)
    .slice(0, quickCount)
    .map(t => toResponseTrack(t, previewMap.get(t.id)!));

  return NextResponse.json({ tracks: result });
}

export async function POST(request: Request) {
  try {
    const { genres, eras, market, userToken, quick, quickCount, excludeIds } = (await request.json()) as {
      genres: string[];
      eras: string[];
      market: string;
      userToken?: string;
      quick?: boolean;
      quickCount?: number;
      excludeIds?: string[];
    };

    if (!genres?.length) {
      return NextResponse.json({ error: "No genres provided" }, { status: 400 });
    }

    const mkt = market || "US";

    if (quick) {
      return handleQuickFetch(genres, eras ?? [], mkt, quickCount ?? 3, userToken);
    }

    const ccToken = await getClientCredentialsToken();
    const exclude = new Set(excludeIds ?? []);

    const allTracks = await gatherTracks(genres, eras ?? [], mkt, ccToken, exclude);
    const previewMap = await resolvePreviews(allTracks, userToken, mkt);

    const result = allTracks
      .filter(t => previewMap.has(t.id))
      .map(t => toResponseTrack(t, previewMap.get(t.id) as string));

    return NextResponse.json({ tracks: result });
  } catch (err) {
    console.error("[API/songs] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
