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
  damageTable: number[]; // damage per snippet level index, last entry = wrong/skip
  snippetDurations: number[]; // seconds per level
  genres: string[];
  eras: string[];
  market: string; // country code
};

export type RoundResult = {
  roundNumber: number;
  teamId: string;
  playerId: string;
  trackId: string;
  trackName: string;
  artistName: string;
  albumArt: string;
  snippetLevel: number;
  correct: boolean;
  artistOnly: boolean;
  damage: number;
  hpAfter: number;
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
