// ─── Game Constants ───

/**
 * Snippet durations in seconds, progressive reveal.
 * -1 means "full song" (last tier plays the entire track).
 */
export const DEFAULT_SNIPPET_DURATIONS = [1, 3, 6, 12, 20, 30];

/**
 * Damage table indexed by snippet level.
 * Index 0 = correct at first snippet (1s) = 0 damage (PERFECT)
 * Last index = wrong guess / skipped all snippets
 */
export const DEFAULT_DAMAGE_TABLE = [0, 5, 10, 15, 20, 25, 30];

/** Default starting HP per team */
export const DEFAULT_STARTING_HP = 100;

/** Available genres for game setup */
export const GENRES = [
  { id: "rock", label: "Rock" },
  { id: "pop", label: "Pop" },
  { id: "metal", label: "Metal" },
  { id: "hip-hop", label: "Hip-Hop" },
  { id: "dance", label: "Dance" },
  { id: "electronic", label: "Electronic" },
  { id: "r-n-b", label: "R&B" },
  { id: "jazz", label: "Jazz" },
  { id: "classical", label: "Classical" },
  { id: "country", label: "Country" },
  { id: "blues", label: "Blues" },
  { id: "reggae", label: "Reggae" },
  { id: "punk", label: "Punk" },
  { id: "soul", label: "Soul" },
  { id: "indie", label: "Indie" },
  { id: "latin", label: "Latin" },
  { id: "funk", label: "Funk" },
  { id: "disco", label: "Disco" },
  { id: "alternative", label: "Alternative" },
  { id: "grunge", label: "Grunge" },
] as const;

/** Available eras (decades) */
export const ERAS = [
  { id: "1960", label: "60s", yearRange: "1960-1969" },
  { id: "1970", label: "70s", yearRange: "1970-1979" },
  { id: "1980", label: "80s", yearRange: "1980-1989" },
  { id: "1990", label: "90s", yearRange: "1990-1999" },
  { id: "2000", label: "00s", yearRange: "2000-2009" },
  { id: "2010", label: "10s", yearRange: "2010-2019" },
  { id: "2020", label: "20s", yearRange: "2020-2029" },
] as const;

/** Available markets (countries) */
export const MARKETS = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "BR", label: "Brazil" },
  { code: "JP", label: "Japan" },
  { code: "AU", label: "Australia" },
  { code: "CA", label: "Canada" },
  { code: "MX", label: "Mexico" },
  { code: "SE", label: "Sweden" },
  { code: "NL", label: "Netherlands" },
  { code: "IL", label: "Israel" },
  { code: "KR", label: "South Korea" },
  { code: "IN", label: "India" },
  { code: "AR", label: "Argentina" },
  { code: "CO", label: "Colombia" },
  { code: "PL", label: "Poland" },
  { code: "ZA", label: "South Africa" },
] as const;

/** Damage result labels */
export const DAMAGE_LABELS: Record<string, string> = {
  PERFECT: "PERFECT",
  HIT: "HIT",
  MISS: "MISS",
};

/** Pick N random genres from the available list */
export function getRandomGenres(count = 1): string[] {
  const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((g) => g.id);
}
