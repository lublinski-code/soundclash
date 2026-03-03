"use client";

import { create } from "zustand";

type SpotifyState = {
  accessToken: string | null;
  userName: string | null;
  userAvatar: string | null;
  error: string | null;

  setAccessToken: (token: string | null) => void;
  setUserInfo: (name: string, avatar: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useSpotifyStore = create<SpotifyState>((set) => ({
  accessToken: null,
  userName: null,
  userAvatar: null,
  error: null,

  setAccessToken: (token) => set({ accessToken: token }),
  setUserInfo: (name, avatar) =>
    set({ userName: name, userAvatar: avatar }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      accessToken: null,
      userName: null,
      userAvatar: null,
      error: null,
    }),
}));
