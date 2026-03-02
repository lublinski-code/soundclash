import type { Team, GamePhase, RoundResult, GameConfig, SpotifyTrack } from "./types";
import { calculateDamage, ARTIST_ONLY_DAMAGE } from "./damage";

export type GameState = {
  phase: GamePhase;
  teams: [Team, Team];
  config: GameConfig;
  songPool: SpotifyTrack[];
  currentSongIndex: number;
  currentTeamIndex: 0 | 1; // which team is guessing
  currentSnippetLevel: number;
  roundNumber: number;
  roundResults: RoundResult[];
  winner: Team | null;
};

export type GameAction =
  | { type: "START_GAME"; songPool: SpotifyTrack[] }
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

/**
 * Normalize a song title for fuzzy matching.
 * Removes common edition suffixes, remaster tags, parenthetical info, etc.
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    // Remove common suffixes in parentheses/brackets
    .replace(/\s*[\(\[].*?(remaster|deluxe|edition|version|remix|live|acoustic|radio|single|extended|original|bonus|demo|anniversary|mono|stereo).*?[\)\]]/gi, "")
    // Remove trailing " - " variants (e.g., "Song - Remastered 2021")
    .replace(/\s*-\s*(remaster|deluxe|edition|version|remix|live|acoustic|radio|single|extended|original|bonus|demo|anniversary|\d{4}).*$/gi, "")
    // Remove "feat." and featured artists from comparison
    .replace(/\s*[\(\[]?\s*feat\.?\s+[^\)\]]+[\)\]]?/gi, "")
    // Normalize whitespace and punctuation
    .replace(/[''`]/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if the guessed track matches the target track.
 * Uses fuzzy matching to handle different editions (remaster, deluxe, live, etc.)
 */
function isTrackMatch(
  guessId: string,
  guessName: string,
  guessArtists: string[],
  target: SpotifyTrack
): boolean {
  // Exact ID match is always correct
  if (guessId === target.id) return true;

  // Fuzzy match: compare normalized titles and check artist overlap
  const normalizedGuess = normalizeTitle(guessName);
  const normalizedTarget = normalizeTitle(target.name);

  // Titles must match (after normalization)
  if (normalizedGuess !== normalizedTarget) return false;

  // At least one artist must match (handles "feat." variations)
  const targetArtists = target.artists.map((a) => a.name.toLowerCase());
  const guessArtistsLower = guessArtists.map((a) => a.toLowerCase());

  return guessArtistsLower.some((g) =>
    targetArtists.some((t) => g.includes(t) || t.includes(g))
  );
}

/**
 * Check if the guessed track's artist matches the target track's artist,
 * even though the song title is wrong. Used for partial credit.
 */
function isArtistMatch(guessArtists: string[], target: SpotifyTrack): boolean {
  const targetArtists = target.artists.map((a) => a.name.toLowerCase());
  const guessLower = guessArtists.map((a) => a.toLowerCase());
  return guessLower.some((g) =>
    targetArtists.some((t) => g.includes(t) || t.includes(g))
  );
}

/**
 * Pure game state reducer. All game logic lives here.
 */
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

    case "SHOW_VS": {
      return { ...state, phase: "VS_SCREEN" };
    }

    case "START_SNIPPET": {
      return {
        ...state,
        phase: "SNIPPET",
        currentSnippetLevel: 0,
      };
    }

    case "NEXT_SNIPPET": {
      return {
        ...state,
        phase: "SNIPPET",
        currentSnippetLevel: state.currentSnippetLevel + 1,
      };
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

      // At max level: artist match gets partial credit, full wrong gets max damage
      const damage = artistMatch
        ? ARTIST_ONLY_DAMAGE
        : calculateDamage(state.currentSnippetLevel, correct, state.config.damageTable);

      const teamIdx = state.currentTeamIndex;
      const team = state.teams[teamIdx];
      const newHp = Math.max(0, team.hp - damage);

      const newTeams = [...state.teams] as [Team, Team];
      newTeams[teamIdx] = { ...team, hp: newHp };

      const activePlayer = team.members[team.activeIndex];

      const result: RoundResult = {
        roundNumber: state.roundNumber,
        teamId: team.id,
        playerId: activePlayer?.id ?? "",
        trackId: currentSong.id,
        trackName: currentSong.name,
        artistName: currentSong.artists.map((a) => a.name).join(", "),
        albumArt: currentSong.album.images[0]?.url ?? "",
        snippetLevel: state.currentSnippetLevel,
        correct,
        artistOnly: artistMatch,
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

    case "SKIP_GUESS": {
      // Check if there are more snippets to play
      const maxLevel = state.config.snippetDurations.length - 1;
      if (state.currentSnippetLevel < maxLevel) {
        return {
          ...state,
          phase: "SNIPPET",
          currentSnippetLevel: state.currentSnippetLevel + 1,
        };
      }

      // No more snippets — treat as wrong answer
      const currentSong = state.songPool[state.currentSongIndex];
      if (!currentSong) return state;

      const damage = calculateDamage(
        state.currentSnippetLevel,
        false,
        state.config.damageTable
      );

      const teamIdx = state.currentTeamIndex;
      const team = state.teams[teamIdx];
      const newHp = Math.max(0, team.hp - damage);

      const newTeams = [...state.teams] as [Team, Team];
      newTeams[teamIdx] = { ...team, hp: newHp };

      const activePlayer = team.members[team.activeIndex];

      const result: RoundResult = {
        roundNumber: state.roundNumber,
        teamId: team.id,
        playerId: activePlayer?.id ?? "",
        trackId: currentSong.id,
        trackName: currentSong.name,
        artistName: currentSong.artists.map((a) => a.name).join(", "),
        albumArt: currentSong.album.images[0]?.url ?? "",
        snippetLevel: state.currentSnippetLevel,
        correct: false,
        artistOnly: false,
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

    case "GIVE_UP": {
      const currentSong = state.songPool[state.currentSongIndex];
      if (!currentSong) return state;

      // Always apply max damage (last entry in damage table = 30)
      const maxDamage =
        state.config.damageTable[state.config.damageTable.length - 1] ?? 30;

      const teamIdx = state.currentTeamIndex;
      const team = state.teams[teamIdx];
      const newHp = Math.max(0, team.hp - maxDamage);

      const newTeams = [...state.teams] as [Team, Team];
      newTeams[teamIdx] = { ...team, hp: newHp };

      const activePlayer = team.members[team.activeIndex];

      const result: RoundResult = {
        roundNumber: state.roundNumber,
        teamId: team.id,
        playerId: activePlayer?.id ?? "",
        trackId: currentSong.id,
        trackName: currentSong.name,
        artistName: currentSong.artists.map((a) => a.name).join(", "),
        albumArt: currentSong.album.images[0]?.url ?? "",
        snippetLevel: state.currentSnippetLevel,
        correct: false,
        artistOnly: false,
        damage: maxDamage,
        hpAfter: newHp,
      };

      return {
        ...state,
        phase: "DAMAGE",
        teams: newTeams,
        roundResults: [...state.roundResults, result],
      };
    }

    case "SHOW_ALBUM": {
      return { ...state, phase: "ALBUM_REVEAL" };
    }

    case "END_ROUND": {
      const teamIdx = state.currentTeamIndex;
      const team = state.teams[teamIdx];

      // Check for KO
      if (team.hp <= 0) {
        const winnerIdx = teamIdx === 0 ? 1 : 0;
        return {
          ...state,
          phase: "KO",
          winner: state.teams[winnerIdx],
        };
      }

      // Rotate active member within the current team
      const newTeams = [...state.teams] as [Team, Team];
      const currentTeam = newTeams[teamIdx];
      newTeams[teamIdx] = {
        ...currentTeam,
        activeIndex:
          (currentTeam.activeIndex + 1) % currentTeam.members.length,
      };

      // Switch to other team, advance song
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
