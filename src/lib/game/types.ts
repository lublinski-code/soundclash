// ─── Core Game Types ───

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  members: Player[];
  hp: number;
  activeIndex: number; // which member guesses next
};

export type GameConfig = {
  startingHp: number;
  correctDamageTable: number[]; // opponent damage per snippet level (correct guess)
  wrongSelfDamage: number; // flat self-damage for miss / forfeit
  snippetDurations: number[]; // seconds per level
  genres: string[];
  eras: string[];
  market: string; // country code
};

export type RoundResult = {
  roundNumber: number;
  teamId: string; // the guessing team
  targetTeamId: string; // team that took the damage
  playerId: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt: string;
  snippetLevel: number;
  correct: boolean;
  artistOnly: boolean;
  damage: number;
  hpAfter: number; // target team's HP after damage
};

export type GamePhase =
  | "LOBBY"
  | "SETUP"
  | "LOADING_SONGS"
  | "VS_SCREEN"
  | "SNIPPET"
  | "GUESS"
  | "DAMAGE"
  | "ALBUM_REVEAL"
  | "ROUND_END"
  | "KO";

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  uri: string;
  duration_ms: number;
  previewUrl: string;
  spotifyUrl: string;
};
