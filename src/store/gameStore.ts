"use client";

import { create } from "zustand";
import type { Team, GameConfig, GamePhase, RoundResult, Track } from "@/lib/game/types";
import {
  DEFAULT_STARTING_HP,
  DEFAULT_CORRECT_DAMAGE_TABLE,
  DEFAULT_WRONG_SELF_DAMAGE,
  DEFAULT_SNIPPET_DURATIONS,
} from "@/lib/game/constants";
import { gameReducer, type GameAction } from "@/lib/game/engine";

type GameStore = {
  phase: GamePhase;
  teams: [Team, Team];
  config: GameConfig;
  songPool: Track[];
  currentSongIndex: number;
  currentTeamIndex: 0 | 1;
  currentSnippetLevel: number;
  roundNumber: number;
  roundResults: RoundResult[];
  winner: Team | null;

  dispatch: (action: GameAction) => void;
  setTeams: (teams: [Team, Team]) => void;
  setConfig: (config: Partial<GameConfig>) => void;
  setPhase: (phase: GamePhase) => void;
};

const defaultTeams: [Team, Team] = [
  {
    id: "team-1",
    name: "Player 1",
    members: [{ id: "default-p1", name: "Player 1" }],
    hp: DEFAULT_STARTING_HP,
    activeIndex: 0,
  },
  {
    id: "team-2",
    name: "Player 2",
    members: [{ id: "default-p2", name: "Player 2" }],
    hp: DEFAULT_STARTING_HP,
    activeIndex: 0,
  },
];

const defaultConfig: GameConfig = {
  startingHp: DEFAULT_STARTING_HP,
  correctDamageTable: [...DEFAULT_CORRECT_DAMAGE_TABLE],
  wrongSelfDamage: DEFAULT_WRONG_SELF_DAMAGE,
  snippetDurations: [...DEFAULT_SNIPPET_DURATIONS],
  genres: [],
  eras: [],
  market: "US",
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "LOBBY",
  teams: defaultTeams,
  config: defaultConfig,
  songPool: [],
  currentSongIndex: 0,
  currentTeamIndex: 0,
  currentSnippetLevel: 0,
  roundNumber: 1,
  roundResults: [],
  winner: null,

  dispatch: (action) => {
    const state = get();
    const newState = gameReducer(
      {
        phase: state.phase,
        teams: state.teams,
        config: state.config,
        songPool: state.songPool,
        currentSongIndex: state.currentSongIndex,
        currentTeamIndex: state.currentTeamIndex,
        currentSnippetLevel: state.currentSnippetLevel,
        roundNumber: state.roundNumber,
        roundResults: state.roundResults,
        winner: state.winner,
      },
      action
    );
    set(newState);
  },

  setTeams: (teams) => set({ teams }),

  setConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  setPhase: (phase) => set({ phase }),
}));
