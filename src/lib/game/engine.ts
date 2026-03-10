import type { Team, GamePhase, RoundResult, GameConfig, Track } from "./types";
import { calculateDamage, ARTIST_ONLY_DAMAGE } from "./damage";

export type GameState = {
  phase: GamePhase;
  teams: [Team, Team];
  config: GameConfig;
  songPool: Track[];
  currentSongIndex: number;
  currentTeamIndex: 0 | 1; // which team is guessing
  currentSnippetLevel: number;
  roundNumber: number;
  roundResults: RoundResult[];
  winner: Team | null;
};

export type GameAction =
  | { type: "START_GAME"; songPool: Track[] }
  | { type: "ADD_SONGS"; songs: Track[] }
  | { type: "REPLACE_POOL"; songs: Track[] }
  | { type: "SHOW_VS" }
  | { type: "START_SNIPPET" }
  | { type: "NEXT_SNIPPET" }
  | { type: "SUBMIT_GUESS"; trackId: string; trackName: string; artistNames: string[] }
  | { type: "SKIP_GUESS" }
  | { type: "GIVE_UP" }
  | { type: "SHOW_DAMAGE" }
  | { type: "SHOW_ALBUM" }
  | { type: "END_ROUND" }
  | { type: "RESET" };

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*[\(\[].*?(remaster|deluxe|edition|version|remix|live|acoustic|radio|single|extended|original|bonus|demo|anniversary|mono|stereo).*?[\)\]]/gi, "")
    .replace(/\s*-\s*(remaster|deluxe|edition|version|remix|live|acoustic|radio|single|extended|original|bonus|demo|anniversary|\d{4}).*$/gi, "")
    .replace(/\s*[\(\[]?\s*feat\.?\s+[^\)\]]+[\)\]]?/gi, "")
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isTrackMatch(
  guessId: string,
  guessName: string,
  guessArtists: string[],
  target: Track
): boolean {
  if (guessId === target.id) return true;

  const normalizedGuess = normalizeTitle(guessName);
  const normalizedTarget = normalizeTitle(target.name);
  if (normalizedGuess !== normalizedTarget) return false;

  const targetArtists = target.artists.map((a) => a.name.toLowerCase());
  const guessArtistsLower = guessArtists.map((a) => a.toLowerCase());
  return guessArtistsLower.some((g) =>
    targetArtists.some((t) => g.includes(t) || t.includes(g))
  );
}

function isArtistMatch(guessArtists: string[], target: Track): boolean {
  const targetArtists = target.artists.map((a) => a.name.toLowerCase());
  const guessLower = guessArtists.map((a) => a.toLowerCase());
  return guessLower.some((g) =>
    targetArtists.some((t) => g.includes(t) || t.includes(g))
  );
}

/**
 * Apply damage to teams and build a RoundResult.
 * Correct / artist-only → opponent takes damage.
 * Wrong / forfeit → guesser takes damage.
 */
function applyDamage(
  state: GameState,
  correct: boolean,
  artistOnly: boolean,
  currentSong: Track
): GameState {
  const teamIdx = state.currentTeamIndex;
  const opponentIdx = (teamIdx === 0 ? 1 : 0) as 0 | 1;

  let damage: number;
  let targetIdx: 0 | 1;

  if (correct) {
    const { damage: d } = calculateDamage(
      state.currentSnippetLevel,
      true,
      state.config.correctDamageTable,
      state.config.wrongSelfDamage
    );
    damage = d;
    targetIdx = opponentIdx;
  } else if (artistOnly) {
    damage = ARTIST_ONLY_DAMAGE;
    targetIdx = opponentIdx;
  } else {
    damage = state.config.wrongSelfDamage;
    targetIdx = teamIdx;
  }

  const targetTeam = state.teams[targetIdx];
  const newHp = Math.max(0, targetTeam.hp - damage);
  const newTeams = [...state.teams] as [Team, Team];
  newTeams[targetIdx] = { ...targetTeam, hp: newHp };

  const guessingTeam = state.teams[teamIdx];
  const activePlayer = guessingTeam.members[guessingTeam.activeIndex];

  const result: RoundResult = {
    roundNumber: state.roundNumber,
    teamId: guessingTeam.id,
    targetTeamId: state.teams[targetIdx].id,
    playerId: activePlayer?.id ?? "",
    trackId: currentSong.id,
    trackName: currentSong.name,
    artistName: currentSong.artists.map((a) => a.name).join(", "),
    albumArt: currentSong.album.images[0]?.url ?? "",
    snippetLevel: state.currentSnippetLevel,
    correct,
    artistOnly,
    damage,
    hpAfter: newHp,
  };

  return {
    ...state,
    phase: "DAMAGE",
    teams: newTeams,
    roundResults: [...state.roundResults, result],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      return {
        ...state,
        phase: "VS_SCREEN",
        songPool: action.songPool,
        currentSongIndex: 0,
        currentTeamIndex: 0,
        currentSnippetLevel: 0,
        roundNumber: 1,
        roundResults: [],
        winner: null,
        teams: [
          { ...state.teams[0], hp: state.config.startingHp, activeIndex: 0 },
          { ...state.teams[1], hp: state.config.startingHp, activeIndex: 0 },
        ],
      };
    }

    case "ADD_SONGS": {
      return { ...state, songPool: [...state.songPool, ...action.songs] };
    }

    case "REPLACE_POOL": {
      const played = state.songPool.slice(0, state.currentSongIndex);
      const playedIds = new Set(played.map(s => s.id));
      const unplayed = action.songs.filter(s => !playedIds.has(s.id));
      return { ...state, songPool: [...played, ...unplayed] };
    }

    case "SHOW_VS": {
      return { ...state, phase: "VS_SCREEN" };
    }

    case "START_SNIPPET": {
      return { ...state, phase: "SNIPPET", currentSnippetLevel: 0 };
    }

    case "NEXT_SNIPPET": {
      return { ...state, phase: "SNIPPET", currentSnippetLevel: state.currentSnippetLevel + 1 };
    }

    case "SUBMIT_GUESS": {
      const currentSong = state.songPool[state.currentSongIndex];
      if (!currentSong) return state;

      const correct = isTrackMatch(
        action.trackId,
        action.trackName,
        action.artistNames,
        currentSong
      );
      const artistMatch = !correct && isArtistMatch(action.artistNames, currentSong);
      const maxLevel = state.config.snippetDurations.length - 1;

      // Right artist but wrong song — give another chance with next snippet
      if (artistMatch && state.currentSnippetLevel < maxLevel) {
        return {
          ...state,
          phase: "SNIPPET",
          currentSnippetLevel: state.currentSnippetLevel + 1,
        };
      }

      // Wrong guess (no artist match) and not at max level → next snippet
      if (!correct && !artistMatch && state.currentSnippetLevel < maxLevel) {
        return {
          ...state,
          phase: "SNIPPET",
          currentSnippetLevel: state.currentSnippetLevel + 1,
        };
      }

      return applyDamage(state, correct, artistMatch, currentSong);
    }

    case "SKIP_GUESS": {
      const maxLevel = state.config.snippetDurations.length - 1;
      if (state.currentSnippetLevel < maxLevel) {
        return {
          ...state,
          phase: "SNIPPET",
          currentSnippetLevel: state.currentSnippetLevel + 1,
        };
      }

      const currentSong = state.songPool[state.currentSongIndex];
      if (!currentSong) return state;

      return applyDamage(state, false, false, currentSong);
    }

    case "GIVE_UP": {
      const currentSong = state.songPool[state.currentSongIndex];
      if (!currentSong) return state;

      return applyDamage(state, false, false, currentSong);
    }

    case "SHOW_ALBUM": {
      return { ...state, phase: "ALBUM_REVEAL" };
    }

    case "END_ROUND": {
      // Check for KO on either team (correct hits opponent, wrong hits self)
      for (let i = 0; i < 2; i++) {
        if (state.teams[i].hp <= 0) {
          const winnerIdx = i === 0 ? 1 : 0;
          return {
            ...state,
            phase: "KO",
            winner: state.teams[winnerIdx],
          };
        }
      }

      const teamIdx = state.currentTeamIndex;

      // Rotate active member within the current team
      const newTeams = [...state.teams] as [Team, Team];
      const currentTeam = newTeams[teamIdx];
      newTeams[teamIdx] = {
        ...currentTeam,
        activeIndex: (currentTeam.activeIndex + 1) % currentTeam.members.length,
      };

      const nextTeamIndex = (teamIdx === 0 ? 1 : 0) as 0 | 1;

      return {
        ...state,
        phase: "VS_SCREEN",
        teams: newTeams,
        currentTeamIndex: nextTeamIndex,
        currentSongIndex: state.currentSongIndex + 1,
        currentSnippetLevel: 0,
        roundNumber: state.roundNumber + 1,
      };
    }

    case "RESET": {
      return {
        ...state,
        phase: "LOBBY",
        roundResults: [],
        winner: null,
        currentSongIndex: 0,
        currentTeamIndex: 0,
        currentSnippetLevel: 0,
        roundNumber: 1,
        songPool: [],
      };
    }

    default:
      return state;
  }
}
