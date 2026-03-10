import { NextResponse } from "next/server";

const DEEZER_BASE = "https://api.deezer.com";

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

type NormalizedTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  rank: number;
  previewUrl: string;
  songUrl: string;
  releaseDate?: string;
};

function normalizeDeezerTrack(t: DeezerTrack): NormalizedTrack {
  return {
    id: String(t.id),
    name: t.title,
    artists: [{ id: String(t.artist.id), name: t.artist.name }],
    album: {
      id: String(t.album.id),
      name: t.album.title,
      images: [
        { url: t.album.cover_xl || t.album.cover_big || t.album.cover_medium, width: 640, height: 640 },
      ],
    },
    duration_ms: t.duration * 1000,
    rank: t.rank,
    previewUrl: t.preview,
    songUrl: `https://www.deezer.com/track/${t.id}`,
  };
}

async function dzFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const resp = await fetch(`${DEEZER_BASE}${endpoint}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      console.warn(`[API/songs] Deezer ${resp.status} on ${endpoint.split("?")[0]}`);
      return null;
    }
    const data = await resp.json();
    if (data.error) {
      console.warn(`[API/songs] Deezer error on ${endpoint.split("?")[0]}:`, data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[API/songs] Deezer fetch error on ${endpoint.split("?")[0]}:`, err);
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

function isValidTrack(t: NormalizedTrack, rankFloor: number): boolean {
  if (!t.id || !t.name || t.duration_ms < 15_000) return false;
  if (!t.artists?.length || !t.album) return false;
  if (!t.previewUrl) return false;
  if (t.rank < rankFloor) return false;

  if (t.artists.some(a => /^various\s*artists?$/i.test(a.name))) return false;

  const nonLatin = (t.name.match(NON_LATIN_SCRIPTS) || []).length;
  const latin = (t.name.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length;
  if (nonLatin > latin) return false;

  for (const pat of OBSCURE_PATTERNS) {
    if (pat.test(t.name)) return false;
  }

  return true;
}

function buildYearRange(eras: string[]): { min: number; max: number } | null {
  if (!eras?.length) return null;
  const starts = eras.map(e => parseInt(e, 10)).filter(n => !isNaN(n));
  if (!starts.length) return null;
  return { min: Math.min(...starts), max: Math.max(...starts) + 9 };
}

function isInEraRange(track: NormalizedTrack, yearRange: { min: number; max: number } | null): boolean {
  if (!yearRange) return true;
  if (!track.releaseDate) return true;
  const year = parseInt(track.releaseDate.slice(0, 4), 10);
  if (isNaN(year)) return true;
  return year >= yearRange.min && year <= yearRange.max;
}

async function searchDeezerTracks(
  query: string,
  limit = 50,
): Promise<DeezerTrack[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    order: "RANKING",
  });
  const data = await dzFetch<{ data?: DeezerTrack[] }>(`/search?${params}`);
  return data?.data ?? [];
}

async function getDeezerArtistId(name: string): Promise<number | null> {
  const params = new URLSearchParams({ q: name, limit: "1" });
  const data = await dzFetch<{ data?: { id: number; name: string }[] }>(`/search/artist?${params}`);
  const items = data?.data;
  if (!items?.length) return null;

  const normalQ = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalA = items[0].name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalA.includes(normalQ) || normalQ.includes(normalA)) return items[0].id;
  return null;
}

async function getDeezerArtistTopTracks(artistId: number, limit = 50): Promise<DeezerTrack[]> {
  const data = await dzFetch<{ data?: DeezerTrack[] }>(`/artist/${artistId}/top?limit=${limit}`);
  return data?.data ?? [];
}

function dedupTracks(tracks: NormalizedTrack[]): NormalizedTrack[] {
  const seen = new Set<string>();
  return tracks.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function toResponseTrack(t: NormalizedTrack) {
  return {
    id: t.id,
    name: t.name,
    artists: t.artists,
    album: t.album,
    duration_ms: t.duration_ms,
    previewUrl: t.previewUrl,
    songUrl: t.songUrl,
  };
}

async function gatherTracks(
  genres: string[],
  eras: string[],
  excludeIds: Set<string>
): Promise<NormalizedTrack[]> {
  const yearRange = buildYearRange(eras);
  const rankFloor = yearRange ? 50000 : 100000;
  const MIN_POOL = 40;

  let allTracks: NormalizedTrack[] = [];

  // Strategy 1: Artist top tracks (best quality — curated popular songs)
  {
    const artistSearches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []);
      for (const artist of artists) {
        artistSearches.push(
          getDeezerArtistId(artist).then(async (id) => {
            if (!id) return [];
            const tracks = await getDeezerArtistTopTracks(id, 50);
            const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
            return tracks
              .filter(t => {
                const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                return normalA.includes(normalQ) || normalQ.includes(normalA);
              })
              .map(normalizeDeezerTrack);
          })
        );
      }
    }

    const batchSize = 10;
    for (let i = 0; i < artistSearches.length; i += batchSize) {
      const batch = artistSearches.slice(i, i + batchSize);
      const results = await Promise.all(batch);
      allTracks.push(...results.flat());
      if (i + batchSize < artistSearches.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }
  allTracks = dedupTracks(allTracks).filter(
    t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor) && isInEraRange(t, yearRange)
  );
  console.log(`[API/songs] Strategy 1 (artist top tracks): ${allTracks.length} tracks`);

  // Strategy 2: Deezer search by artist name (catches more songs)
  if (allTracks.length < MIN_POOL) {
    const searches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 20);
      for (const artist of artists) {
        const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
        searches.push(
          searchDeezerTracks(`artist:"${artist}"`, 50).then(tracks =>
            tracks
              .filter(t => {
                const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                return normalA.includes(normalQ) || normalQ.includes(normalA);
              })
              .map(normalizeDeezerTrack)
          )
        );
      }
    }

    const batchSize = 10;
    for (let i = 0; i < searches.length; i += batchSize) {
      const batch = searches.slice(i, i + batchSize);
      const results = await Promise.all(batch);
      allTracks.push(...results.flat());
      if (i + batchSize < searches.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    allTracks = dedupTracks(allTracks).filter(
      t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor) && isInEraRange(t, yearRange)
    );
    console.log(`[API/songs] Strategy 2 (artist search): ${allTracks.length} tracks`);
  }

  // Strategy 3: Broader search without era filter if pool is still thin
  if (allTracks.length < MIN_POOL && yearRange) {
    const searches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 15);
      for (const artist of artists) {
        const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
        searches.push(
          searchDeezerTracks(`artist:"${artist}"`, 50).then(tracks =>
            tracks
              .filter(t => {
                const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                return normalA.includes(normalQ) || normalQ.includes(normalA);
              })
              .map(normalizeDeezerTrack)
          )
        );
      }
    }

    const batchSize = 10;
    for (let i = 0; i < searches.length; i += batchSize) {
      const batch = searches.slice(i, i + batchSize);
      const results = await Promise.all(batch);
      allTracks.push(...results.flat());
      if (i + batchSize < searches.length) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    allTracks = dedupTracks(allTracks).filter(
      t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor)
    );
    console.log(`[API/songs] Strategy 3 (no year filter): ${allTracks.length} tracks`);
  }

  // Artist diversity cap — keep up to 4 tracks per artist
  const artistCount: Record<string, number> = {};
  allTracks = shuffle(allTracks).filter(t => {
    const mainArtist = t.artists[0]?.name ?? "unknown";
    artistCount[mainArtist] = (artistCount[mainArtist] ?? 0) + 1;
    return artistCount[mainArtist] <= 4;
  });

  allTracks = allTracks
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 200);

  return allTracks;
}

async function handleQuickFetch(
  genres: string[],
  eras: string[],
  quickCount: number
) {
  const yearRange = buildYearRange(eras);
  const rankFloor = yearRange ? 50000 : 100000;

  console.log(`[API/songs] Quick fetch: genres=[${genres}], eras=[${eras}]`);

  // Artist top tracks — fast and high quality
  const artistSearches: Promise<NormalizedTrack[]>[] = [];
  for (const genre of genres) {
    const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 8);
    for (const artist of artists) {
      artistSearches.push(
        getDeezerArtistId(artist).then(async (id) => {
          if (!id) return [];
          const tracks = await getDeezerArtistTopTracks(id, 25);
          const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
          return tracks
            .filter(t => {
              const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              return normalA.includes(normalQ) || normalQ.includes(normalA);
            })
            .map(normalizeDeezerTrack);
        })
      );
    }
  }

  // Search by artist name in parallel
  const searchQueries: Promise<NormalizedTrack[]>[] = [];
  for (const genre of genres) {
    const artists = shuffle(GENRE_ARTISTS[genre] ?? []).slice(0, 6);
    for (const artist of artists) {
      const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
      searchQueries.push(
        searchDeezerTracks(`artist:"${artist}"`, 25).then(tracks =>
          tracks
            .filter(t => {
              const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
              return normalA.includes(normalQ) || normalQ.includes(normalA);
            })
            .map(normalizeDeezerTrack)
        )
      );
    }
  }

  const [artistResults, searchResults] = await Promise.all([
    Promise.all(artistSearches),
    Promise.all(searchQueries),
  ]);

  let candidates = [
    ...artistResults.flat(),
    ...searchResults.flat(),
  ];

  candidates = dedupTracks(candidates).filter(
    t => isValidTrack(t, rankFloor) && isInEraRange(t, yearRange)
  );
  console.log(`[API/songs] Quick mode: ${candidates.length} candidates after filter`);

  // If era filter was too strict, retry without it
  if (candidates.length < quickCount && yearRange) {
    candidates = dedupTracks([...artistResults.flat(), ...searchResults.flat()]).filter(
      t => isValidTrack(t, rankFloor)
    );
    console.log(`[API/songs] Quick mode (no year): ${candidates.length} candidates`);
  }

  candidates = candidates.sort((a, b) => b.rank - a.rank).slice(0, 60);

  const result = shuffle(candidates)
    .slice(0, quickCount)
    .map(toResponseTrack);

  return NextResponse.json({ tracks: result });
}

export async function POST(request: Request) {
  try {
    const { genres, eras, quick, quickCount, excludeIds } = (await request.json()) as {
      genres: string[];
      eras: string[];
      quick?: boolean;
      quickCount?: number;
      excludeIds?: string[];
    };

    if (!genres?.length) {
      return NextResponse.json({ error: "No genres provided" }, { status: 400 });
    }

    if (quick) {
      return handleQuickFetch(genres, eras ?? [], quickCount ?? 3);
    }

    const exclude = new Set(excludeIds ?? []);
    const allTracks = await gatherTracks(genres, eras ?? [], exclude);

    const result = allTracks
      .filter(t => !!t.previewUrl)
      .map(toResponseTrack);

    return NextResponse.json({ tracks: result });
  } catch (err) {
    console.error("[API/songs] Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
