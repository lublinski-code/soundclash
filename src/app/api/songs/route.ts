import { NextResponse } from "next/server";

const DEEZER_BASE = "https://api.deezer.com";

const GENRE_ERA_ARTISTS: Record<string, Record<string, string[]>> = {
  rock: {
    all: [
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
    "1960": ["The Beatles", "The Rolling Stones", "The Who", "Led Zeppelin", "Cream", "Jimi Hendrix", "The Doors", "The Kinks", "Creedence Clearwater Revival"],
    "1970": ["Led Zeppelin", "Pink Floyd", "Queen", "Fleetwood Mac", "Aerosmith", "AC/DC", "Heart", "The Eagles", "Deep Purple", "Black Sabbath", "ZZ Top", "Lynyrd Skynyrd", "Boston", "Styx", "Kansas"],
    "1980": ["Journey", "Def Leppard", "Van Halen", "Scorpions", "Foreigner", "Toto", "REO Speedwagon", "Whitesnake", "Boston", "Bon Jovi", "The Police", "Tom Petty", "Bruce Springsteen", "Bryan Adams", "ZZ Top", "Pat Benatar", "Dire Straits", "Billy Joel", "Guns N' Roses", "U2"],
    "1990": ["Nirvana", "Pearl Jam", "Soundgarden", "Alice In Chains", "Green Day", "Foo Fighters", "Oasis", "Red Hot Chili Peppers", "Smashing Pumpkins", "Stone Temple Pilots", "Weezer", "Radiohead", "Bush", "Third Eye Blind", "Matchbox Twenty", "Creed"],
    "2000": ["Linkin Park", "Coldplay", "Nickelback", "Creed", "3 Doors Down", "Kings of Leon", "The Killers", "Muse", "Green Day", "Red Hot Chili Peppers", "Foo Fighters", "Fall Out Boy", "My Chemical Romance"],
    "2010": ["Imagine Dragons", "Arctic Monkeys", "Muse", "Twenty One Pilots", "Fall Out Boy", "Paramore", "Foo Fighters", "Coldplay", "The Black Keys", "Royal Blood", "Greta Van Fleet"],
    "2020": ["Foo Fighters", "Coldplay", "Imagine Dragons", "Greta Van Fleet", "Måneskin", "Royal Blood"],
  },
  pop: {
    all: [
      "Taylor Swift", "Ed Sheeran", "Adele", "Bruno Mars", "Dua Lipa",
      "The Weeknd", "Billie Eilish", "Justin Bieber", "Ariana Grande", "Lady Gaga",
      "Rihanna", "Katy Perry", "Beyoncé", "Shakira", "Michael Jackson",
      "Madonna", "Olivia Rodrigo", "Harry Styles", "Doja Cat", "SZA",
      "Prince", "Whitney Houston", "George Michael", "Phil Collins", "Cyndi Lauper",
      "Duran Duran", "a-ha", "Tears for Fears", "Eurythmics", "Wham!",
      "Lionel Richie", "Culture Club", "Hall & Oates", "Rick Astley", "Pet Shop Boys",
      "Backstreet Boys", "NSYNC", "Spice Girls", "TLC", "Britney Spears",
      "Christina Aguilera", "Mariah Carey", "Celine Dion",
      "Amy Winehouse", "Lorde", "Miley Cyrus", "Sia", "Sam Smith",
      "Elton John", "Robbie Williams", "Coldplay", "OneRepublic",
    ],
    "1960": ["The Beatles", "The Beach Boys", "The Supremes", "Elvis Presley", "Roy Orbison", "Dusty Springfield", "Petula Clark"],
    "1970": ["ABBA", "Bee Gees", "Elton John", "Stevie Wonder", "Donna Summer", "Fleetwood Mac", "Carpenters", "Barry Manilow", "Billy Joel"],
    "1980": ["Michael Jackson", "Madonna", "Prince", "Whitney Houston", "George Michael", "Phil Collins", "Cyndi Lauper", "Duran Duran", "a-ha", "Tears for Fears", "Eurythmics", "Wham!", "Lionel Richie", "Culture Club", "Hall & Oates", "Rick Astley", "Pet Shop Boys", "Tina Turner", "Bon Jovi"],
    "1990": ["Backstreet Boys", "NSYNC", "Spice Girls", "TLC", "Britney Spears", "Christina Aguilera", "Mariah Carey", "Celine Dion", "Whitney Houston", "Alanis Morissette", "No Doubt", "Ace of Base", "Hanson", "Savage Garden", "Robbie Williams"],
    "2000": ["Beyoncé", "Rihanna", "Justin Timberlake", "Shakira", "Nelly Furtado", "Kelly Clarkson", "Amy Winehouse", "Alicia Keys", "Gwen Stefani", "Black Eyed Peas", "Usher", "Fergie"],
    "2010": ["Taylor Swift", "Ed Sheeran", "Adele", "Bruno Mars", "Lady Gaga", "Katy Perry", "Justin Bieber", "Ariana Grande", "Sam Smith", "Sia", "Lorde", "Miley Cyrus", "The Weeknd", "Dua Lipa", "Shawn Mendes"],
    "2020": ["Olivia Rodrigo", "Harry Styles", "Doja Cat", "Dua Lipa", "Billie Eilish", "The Weeknd", "Taylor Swift", "Bad Bunny", "SZA", "Sabrina Carpenter", "Chappell Roan"],
  },
  metal: {
    all: [
      "Metallica", "Iron Maiden", "Black Sabbath", "Slayer", "Megadeth",
      "Pantera", "Judas Priest", "System Of A Down", "Avenged Sevenfold",
      "Tool", "Rammstein", "Slipknot", "Korn", "Disturbed", "Ozzy Osbourne",
      "Dio", "Motörhead", "Anthrax", "Alice Cooper", "Whitesnake",
      "Guns N' Roses", "Deep Purple", "Rainbow", "Accept", "Dokken",
      "Twisted Sister", "Quiet Riot", "Mötley Crüe", "Poison",
      "Sepultura", "Machine Head", "Rage Against the Machine",
      "Alice In Chains", "Soundgarden", "Queensrÿche",
    ],
    "1970": ["Black Sabbath", "Deep Purple", "Judas Priest", "Rainbow", "Motörhead", "Alice Cooper", "Uriah Heep", "Scorpions"],
    "1980": ["Metallica", "Iron Maiden", "Slayer", "Megadeth", "Anthrax", "Dio", "Ozzy Osbourne", "Twisted Sister", "Quiet Riot", "Mötley Crüe", "Poison", "Whitesnake", "Dokken", "Accept", "Queensrÿche", "Def Leppard", "Guns N' Roses"],
    "1990": ["Pantera", "Sepultura", "Machine Head", "Rage Against the Machine", "Alice In Chains", "Soundgarden", "Tool", "Korn", "Slipknot", "System Of A Down", "Fear Factory", "Faith No More"],
    "2000": ["System Of A Down", "Slipknot", "Korn", "Disturbed", "Avenged Sevenfold", "Tool", "Rammstein", "Killswitch Engage", "Lamb of God", "Mastodon"],
    "2010": ["Avenged Sevenfold", "Ghost", "Gojira", "Mastodon", "Rammstein", "Slipknot", "Metallica", "Disturbed"],
    "2020": ["Ghost", "Gojira", "Spiritbox", "Metallica", "Rammstein"],
  },
  "hip-hop": {
    all: [
      "Eminem", "Kendrick Lamar", "Drake", "Jay-Z", "Kanye West",
      "Tupac", "Notorious B.I.G.", "Snoop Dogg", "Travis Scott", "J. Cole",
      "Nas", "Lil Wayne", "50 Cent", "Post Malone", "Dr. Dre",
      "OutKast", "Nicki Minaj", "Cardi B", "Tyler, The Creator", "A$AP Rocky",
      "Run-D.M.C.", "Beastie Boys", "N.W.A", "LL Cool J", "Public Enemy",
      "Wu-Tang Clan", "A Tribe Called Quest", "De La Soul", "Ice Cube", "DMX",
      "Missy Elliott", "Lauryn Hill", "Busta Rhymes", "Method Man",
    ],
    "1980": ["Run-D.M.C.", "Beastie Boys", "LL Cool J", "Public Enemy", "N.W.A", "Eric B. & Rakim", "Salt-N-Pepa", "Big Daddy Kane"],
    "1990": ["Tupac", "Notorious B.I.G.", "Nas", "Wu-Tang Clan", "Snoop Dogg", "Dr. Dre", "Jay-Z", "OutKast", "A Tribe Called Quest", "Lauryn Hill", "DMX", "Busta Rhymes", "Ice Cube", "Missy Elliott", "Method Man", "Eminem"],
    "2000": ["Eminem", "Jay-Z", "Kanye West", "50 Cent", "Lil Wayne", "Nelly", "Ludacris", "T.I.", "OutKast", "Missy Elliott"],
    "2010": ["Kendrick Lamar", "Drake", "J. Cole", "Travis Scott", "A$AP Rocky", "Nicki Minaj", "Cardi B", "Post Malone", "Tyler, The Creator", "Childish Gambino", "Chance the Rapper", "Future", "Migos"],
    "2020": ["Kendrick Lamar", "Drake", "Travis Scott", "Tyler, The Creator", "Lil Baby", "Jack Harlow", "Doja Cat", "Megan Thee Stallion", "21 Savage"],
  },
  dance: {
    all: [
      "Calvin Harris", "David Guetta", "Avicii", "Tiësto", "Marshmello",
      "Martin Garrix", "Kygo", "Zedd", "The Chainsmokers", "Major Lazer",
      "Clean Bandit", "Disclosure", "Daft Punk", "Robin Schulz", "Joel Corry",
      "Swedish House Mafia", "Armin van Buuren", "Alesso", "Diplo", "DJ Snake",
    ],
    "1990": ["The Prodigy", "Faithless", "Chemical Brothers", "Fatboy Slim", "Robert Miles", "Underworld", "2 Unlimited"],
    "2000": ["Daft Punk", "Tiësto", "David Guetta", "Armin van Buuren", "Deadmau5", "Benny Benassi", "Paul van Dyk"],
    "2010": ["Calvin Harris", "Avicii", "Martin Garrix", "Marshmello", "Kygo", "Zedd", "The Chainsmokers", "Swedish House Mafia", "Major Lazer", "Clean Bandit", "Disclosure", "Robin Schulz"],
    "2020": ["Joel Corry", "Fisher", "Fred Again", "Calvin Harris", "David Guetta", "Marshmello"],
  },
  electronic: {
    all: [
      "Daft Punk", "Deadmau5", "Skrillex", "Aphex Twin", "The Prodigy",
      "Chemical Brothers", "Kraftwerk", "Depeche Mode", "Fatboy Slim", "Moby",
      "Flume", "ODESZA", "Bonobo", "Justice", "Caribou",
      "New Order", "Pet Shop Boys", "Erasure", "Gary Numan", "Orbital",
    ],
    "1970": ["Kraftwerk", "Tangerine Dream", "Jean-Michel Jarre"],
    "1980": ["Depeche Mode", "New Order", "Pet Shop Boys", "Erasure", "Gary Numan", "Kraftwerk", "Yazoo", "OMD"],
    "1990": ["The Prodigy", "Chemical Brothers", "Fatboy Slim", "Moby", "Orbital", "Aphex Twin", "Underworld", "Massive Attack", "Portishead"],
    "2000": ["Daft Punk", "Deadmau5", "Justice", "MGMT", "LCD Soundsystem", "Moby", "Röyksopp"],
    "2010": ["Skrillex", "Flume", "ODESZA", "Bonobo", "Caribou", "Disclosure", "Jamie XX", "Porter Robinson"],
    "2020": ["Fred Again", "Flume", "ODESZA", "Bonobo", "Jamie XX"],
  },
  "r-n-b": {
    all: [
      "Usher", "Alicia Keys", "Frank Ocean", "The Weeknd", "SZA",
      "Beyoncé", "Chris Brown", "Ne-Yo", "John Legend", "H.E.R.",
      "Miguel", "Khalid", "Daniel Caesar", "Lauryn Hill", "Mary J. Blige",
      "Whitney Houston", "Marvin Gaye", "Stevie Wonder", "D'Angelo", "TLC",
      "Boyz II Men", "Aaliyah", "Toni Braxton", "Janet Jackson",
      "Luther Vandross", "Anita Baker", "Bobby Brown", "New Edition",
    ],
    "1960": ["Marvin Gaye", "Stevie Wonder", "Aretha Franklin", "Otis Redding", "Sam Cooke", "The Temptations", "The Supremes"],
    "1970": ["Stevie Wonder", "Marvin Gaye", "Al Green", "Earth Wind & Fire", "Curtis Mayfield", "Barry White", "Chaka Khan"],
    "1980": ["Whitney Houston", "Janet Jackson", "Luther Vandross", "Anita Baker", "Bobby Brown", "New Edition", "Prince", "Tina Turner", "Lionel Richie"],
    "1990": ["TLC", "Boyz II Men", "Aaliyah", "Toni Braxton", "Mary J. Blige", "D'Angelo", "Lauryn Hill", "R. Kelly", "Usher", "Brandy"],
    "2000": ["Usher", "Alicia Keys", "Beyoncé", "Ne-Yo", "Chris Brown", "John Legend", "Rihanna", "Destiny's Child"],
    "2010": ["Frank Ocean", "The Weeknd", "SZA", "Miguel", "Khalid", "Daniel Caesar", "H.E.R.", "Bryson Tiller", "Jhené Aiko"],
    "2020": ["SZA", "The Weeknd", "Daniel Caesar", "H.E.R.", "Summer Walker", "Doja Cat", "Victoria Monét"],
  },
  jazz: {
    all: [
      "Miles Davis", "John Coltrane", "Louis Armstrong", "Duke Ellington",
      "Ella Fitzgerald", "Billie Holiday", "Charlie Parker", "Thelonious Monk",
      "Dave Brubeck", "Nina Simone", "Herbie Hancock", "Chet Baker",
    ],
  },
  classical: {
    all: [
      "Beethoven", "Mozart", "Bach", "Chopin", "Vivaldi",
      "Tchaikovsky", "Debussy", "Schubert", "Brahms", "Dvořák",
    ],
  },
  country: {
    all: [
      "Johnny Cash", "Dolly Parton", "Luke Combs", "Morgan Wallen",
      "Carrie Underwood", "Blake Shelton", "Keith Urban", "Tim McGraw",
      "Shania Twain", "Willie Nelson", "Chris Stapleton", "Zach Bryan",
      "Jason Aldean", "Kenny Chesney", "George Strait",
      "Garth Brooks", "Alan Jackson", "Reba McEntire", "Hank Williams",
      "Brooks & Dunn", "Toby Keith", "Brad Paisley", "Alabama",
    ],
    "1960": ["Johnny Cash", "Patsy Cline", "Loretta Lynn", "Merle Haggard", "Buck Owens", "Tammy Wynette"],
    "1970": ["Willie Nelson", "Waylon Jennings", "Dolly Parton", "Kenny Rogers", "Conway Twitty", "George Jones"],
    "1980": ["George Strait", "Reba McEntire", "Alabama", "Hank Williams Jr.", "Randy Travis", "Dwight Yoakam"],
    "1990": ["Garth Brooks", "Shania Twain", "Alan Jackson", "Brooks & Dunn", "Tim McGraw", "Faith Hill", "Toby Keith", "Dixie Chicks"],
    "2000": ["Carrie Underwood", "Brad Paisley", "Kenny Chesney", "Keith Urban", "Jason Aldean", "Tim McGraw", "Taylor Swift"],
    "2010": ["Luke Combs", "Chris Stapleton", "Morgan Wallen", "Zach Bryan", "Kacey Musgraves", "Luke Bryan", "Florida Georgia Line"],
    "2020": ["Morgan Wallen", "Zach Bryan", "Luke Combs", "Chris Stapleton", "Lainey Wilson", "Jelly Roll"],
  },
  blues: {
    all: [
      "B.B. King", "Muddy Waters", "Stevie Ray Vaughan", "Robert Johnson",
      "Howlin' Wolf", "Eric Clapton", "John Lee Hooker", "Buddy Guy",
      "Etta James", "Albert King", "Keb' Mo'", "Joe Bonamassa",
    ],
  },
  reggae: {
    all: [
      "Bob Marley", "Peter Tosh", "Jimmy Cliff", "UB40", "Sean Paul",
      "Damian Marley", "Shaggy", "Ziggy Marley", "Buju Banton", "Lee Perry",
    ],
  },
  punk: {
    all: [
      "The Ramones", "Sex Pistols", "The Clash", "Green Day", "Blink-182",
      "The Offspring", "Bad Religion", "NOFX", "Sum 41", "Misfits",
      "Dead Kennedys", "Rancid", "Rise Against", "Pennywise", "Social Distortion",
    ],
    "1970": ["The Ramones", "Sex Pistols", "The Clash", "Buzzcocks", "The Damned", "Richard Hell"],
    "1980": ["Dead Kennedys", "Misfits", "Bad Religion", "Social Distortion", "Minor Threat", "Black Flag", "Descendents"],
    "1990": ["Green Day", "Blink-182", "The Offspring", "Rancid", "NOFX", "Pennywise", "Bad Religion", "Sum 41"],
    "2000": ["Green Day", "Blink-182", "Sum 41", "Rise Against", "Good Charlotte", "My Chemical Romance", "AFI"],
    "2010": ["Rise Against", "Green Day", "The Interrupters", "IDLES", "Turnstile"],
  },
  soul: {
    all: [
      "Aretha Franklin", "Marvin Gaye", "Stevie Wonder", "Ray Charles",
      "James Brown", "Otis Redding", "Al Green", "Sam Cooke",
      "Curtis Mayfield", "Bill Withers", "Isaac Hayes", "Leon Bridges",
      "Tina Turner", "Diana Ross", "Gladys Knight", "Smokey Robinson",
    ],
    "1960": ["Aretha Franklin", "Otis Redding", "Sam Cooke", "James Brown", "Ray Charles", "Marvin Gaye", "The Temptations", "Smokey Robinson", "Diana Ross"],
    "1970": ["Stevie Wonder", "Marvin Gaye", "Al Green", "Curtis Mayfield", "Bill Withers", "Isaac Hayes", "Gladys Knight", "Barry White"],
    "1980": ["Tina Turner", "Whitney Houston", "Luther Vandross", "Anita Baker", "Prince"],
    "2010": ["Leon Bridges", "Anderson .Paak", "H.E.R.", "John Legend"],
  },
  indie: {
    all: [
      "Arctic Monkeys", "Tame Impala", "Radiohead", "The Strokes",
      "Vampire Weekend", "The National", "Bon Iver", "Fleet Foxes",
      "Mac DeMarco", "Arcade Fire", "Phoebe Bridgers", "Beach House",
      "The XX", "Modest Mouse", "The Smiths",
    ],
    "1980": ["The Smiths", "R.E.M.", "Pixies", "Sonic Youth", "The Cure", "Cocteau Twins"],
    "1990": ["Radiohead", "Modest Mouse", "Pavement", "Elliott Smith", "Neutral Milk Hotel", "Belle and Sebastian"],
    "2000": ["The Strokes", "Arctic Monkeys", "Arcade Fire", "Vampire Weekend", "Fleet Foxes", "The XX", "MGMT", "Franz Ferdinand"],
    "2010": ["Tame Impala", "Mac DeMarco", "Bon Iver", "Beach House", "Phoebe Bridgers", "The National", "Alt-J", "Glass Animals"],
    "2020": ["Phoebe Bridgers", "Tame Impala", "Glass Animals", "Wet Leg", "Alvvays", "Fontaines D.C."],
  },
  latin: {
    all: [
      "Bad Bunny", "J Balvin", "Shakira", "Daddy Yankee", "Ozuna",
      "Maluma", "Rosalía", "Luis Fonsi", "Enrique Iglesias", "Ricky Martin",
      "Marc Anthony", "Juanes", "Karol G", "Rauw Alejandro", "Nicky Jam",
    ],
    "1990": ["Ricky Martin", "Enrique Iglesias", "Marc Anthony", "Gloria Estefan", "Carlos Vives", "Selena"],
    "2000": ["Shakira", "Daddy Yankee", "Juanes", "Don Omar", "Marc Anthony", "Enrique Iglesias"],
    "2010": ["Bad Bunny", "J Balvin", "Ozuna", "Maluma", "Luis Fonsi", "Nicky Jam", "Rosalía", "Karol G"],
    "2020": ["Bad Bunny", "Karol G", "Rauw Alejandro", "Rosalía", "Peso Pluma", "Feid"],
  },
  funk: {
    all: [
      "James Brown", "Parliament", "Funkadelic", "Earth Wind & Fire",
      "Sly and the Family Stone", "Prince", "Rick James", "Bootsy Collins",
      "Tower of Power", "The Meters", "Kool & The Gang", "Chic",
    ],
    "1960": ["James Brown", "Sly and the Family Stone", "The Meters"],
    "1970": ["Parliament", "Funkadelic", "Earth Wind & Fire", "Kool & The Gang", "Chic", "Bootsy Collins", "Tower of Power", "Rick James"],
    "1980": ["Prince", "Rick James", "Cameo", "The Gap Band"],
  },
  disco: {
    all: [
      "Bee Gees", "Donna Summer", "Gloria Gaynor", "ABBA", "Chic",
      "KC and the Sunshine Band", "Village People", "Kool & The Gang",
      "Earth Wind & Fire", "Diana Ross", "Daft Punk", "Kylie Minogue",
    ],
    "1970": ["Bee Gees", "Donna Summer", "Gloria Gaynor", "ABBA", "Chic", "KC and the Sunshine Band", "Village People", "Kool & The Gang", "Earth Wind & Fire", "Diana Ross"],
  },
  alternative: {
    all: [
      "Radiohead", "R.E.M.", "The Cure", "Depeche Mode", "The Smiths",
      "Pixies", "Joy Division", "New Order", "Talking Heads", "Blur",
      "Beck", "Cage The Elephant", "alt-J", "Gorillaz", "Placebo",
      "Nine Inch Nails", "The Cranberries", "Garbage", "Sonic Youth", "Bjork",
    ],
    "1980": ["The Cure", "Depeche Mode", "The Smiths", "Joy Division", "New Order", "Talking Heads", "Sonic Youth", "Pixies", "R.E.M."],
    "1990": ["Radiohead", "Blur", "Beck", "The Cranberries", "Garbage", "Nine Inch Nails", "Placebo", "Bjork", "Tori Amos", "Jeff Buckley"],
    "2000": ["Gorillaz", "Muse", "The White Stripes", "Interpol", "Yeah Yeah Yeahs", "The Strokes"],
    "2010": ["Cage The Elephant", "alt-J", "Tame Impala", "Glass Animals", "Twenty One Pilots", "Gorillaz"],
    "2020": ["Glass Animals", "Wet Leg", "Fontaines D.C.", "IDLES"],
  },
  grunge: {
    all: [
      "Nirvana", "Pearl Jam", "Soundgarden", "Alice In Chains",
      "Stone Temple Pilots", "Mudhoney", "Screaming Trees", "Temple of the Dog",
      "Bush", "Silverchair", "Hole", "Smashing Pumpkins",
    ],
    "1990": ["Nirvana", "Pearl Jam", "Soundgarden", "Alice In Chains", "Stone Temple Pilots", "Mudhoney", "Screaming Trees", "Temple of the Dog", "Bush", "Silverchair", "Hole", "Smashing Pumpkins"],
  },
};

function getArtistsForGenreEras(genre: string, eras: string[]): string[] {
  const map = GENRE_ERA_ARTISTS[genre] ?? {};
  if (!eras.length) return map.all ?? [];
  const result = new Set<string>();
  for (const era of eras) {
    for (const artist of (map[era] ?? [])) {
      result.add(artist);
    }
  }
  if (result.size === 0) return map.all ?? [];
  return [...result];
}

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

function pickDiverse(candidates: NormalizedTrack[], count: number): NormalizedTrack[] {
  const seen = new Set<string>();
  const picked: NormalizedTrack[] = [];
  for (const t of candidates) {
    const artist = t.artists[0]?.name ?? "";
    if (!seen.has(artist)) {
      seen.add(artist);
      picked.push(t);
      if (picked.length >= count) break;
    }
  }
  if (picked.length < count) {
    for (const t of candidates) {
      if (!picked.includes(t)) {
        picked.push(t);
        if (picked.length >= count) break;
      }
    }
  }
  return picked;
}

function fetchArtistTracks(artist: string): Promise<NormalizedTrack[]> {
  const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
  return getDeezerArtistId(artist).then(async (id) => {
    if (!id) return [];
    const tracks = await getDeezerArtistTopTracks(id, 50);
    return tracks
      .filter(t => {
        const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalA.includes(normalQ) || normalQ.includes(normalA);
      })
      .map(normalizeDeezerTrack);
  });
}

function searchArtistTracks(artist: string, limit = 50): Promise<NormalizedTrack[]> {
  const normalQ = artist.toLowerCase().replace(/[^a-z0-9]/g, "");
  return searchDeezerTracks(`artist:"${artist}"`, limit).then(tracks =>
    tracks
      .filter(t => {
        const normalA = t.artist.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return normalA.includes(normalQ) || normalQ.includes(normalA);
      })
      .map(normalizeDeezerTrack)
  );
}

async function runBatched(promises: Promise<NormalizedTrack[]>[], batchSize = 10): Promise<NormalizedTrack[]> {
  const all: NormalizedTrack[] = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const results = await Promise.all(batch);
    all.push(...results.flat());
    if (i + batchSize < promises.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return all;
}

async function gatherTracks(
  genres: string[],
  eras: string[],
  excludeIds: Set<string>
): Promise<NormalizedTrack[]> {
  const rankFloor = eras.length ? 50000 : 100000;
  const MIN_POOL = 40;

  let allTracks: NormalizedTrack[] = [];

  // Strategy 1: Artist top tracks from era-appropriate artists
  {
    const searches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(getArtistsForGenreEras(genre, eras));
      for (const artist of artists) {
        searches.push(fetchArtistTracks(artist));
      }
    }
    allTracks.push(...await runBatched(searches));
  }
  allTracks = dedupTracks(allTracks).filter(
    t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor)
  );
  console.log(`[API/songs] Strategy 1 (artist top tracks): ${allTracks.length} tracks`);

  // Strategy 2: Deezer search by artist name
  if (allTracks.length < MIN_POOL) {
    const searches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const artists = shuffle(getArtistsForGenreEras(genre, eras)).slice(0, 20);
      for (const artist of artists) {
        searches.push(searchArtistTracks(artist));
      }
    }
    allTracks.push(...await runBatched(searches));
    allTracks = dedupTracks(allTracks).filter(
      t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor)
    );
    console.log(`[API/songs] Strategy 2 (artist search): ${allTracks.length} tracks`);
  }

  // Strategy 3: Fall back to "all" artists if era-specific list was too narrow
  if (allTracks.length < MIN_POOL && eras.length) {
    const searches: Promise<NormalizedTrack[]>[] = [];
    for (const genre of genres) {
      const allArtists = shuffle(GENRE_ERA_ARTISTS[genre]?.all ?? []).slice(0, 15);
      for (const artist of allArtists) {
        searches.push(searchArtistTracks(artist));
      }
    }
    allTracks.push(...await runBatched(searches));
    allTracks = dedupTracks(allTracks).filter(
      t => !excludeIds.has(t.id) && isValidTrack(t, rankFloor)
    );
    console.log(`[API/songs] Strategy 3 (all artists fallback): ${allTracks.length} tracks`);
  }

  // Artist diversity cap
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
  const rankFloor = eras.length ? 50000 : 100000;

  console.log(`[API/songs] Quick fetch: genres=[${genres}], eras=[${eras}]`);

  // Artist top tracks from era-appropriate artists
  const artistSearches: Promise<NormalizedTrack[]>[] = [];
  for (const genre of genres) {
    const artists = shuffle(getArtistsForGenreEras(genre, eras)).slice(0, 8);
    for (const artist of artists) {
      artistSearches.push(fetchArtistTracks(artist));
    }
  }

  // Search by artist name in parallel
  const searchQueries: Promise<NormalizedTrack[]>[] = [];
  for (const genre of genres) {
    const artists = shuffle(getArtistsForGenreEras(genre, eras)).slice(0, 6);
    for (const artist of artists) {
      searchQueries.push(searchArtistTracks(artist, 25));
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
    t => isValidTrack(t, rankFloor)
  );
  console.log(`[API/songs] Quick mode: ${candidates.length} candidates after filter`);

  candidates = candidates.sort((a, b) => b.rank - a.rank).slice(0, 60);

  const result = pickDiverse(shuffle(candidates), quickCount)
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
