import type { Team, GamePhase, RoundResult, GameConfig, SpotifyTrack } from "./types";
import { calculateDamage } from "./damage";

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
  | { type: "SUBMIT_GUESS"; trackId: string }
  | { type: "SKIP_GUESS" }
  | { type: "SHOW_DAMAGE" }
  | { type: "SHOW_ALBUM" }
  | { type: "END_ROUND" }
  | { type: "RESET" };

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

      const correct = action.trackId === currentSong.id;
      const damage = calculateDamage(
        state.currentSnippetLevel,
        correct,
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
        correct,
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
