"use client";

import { create } from "zustand";

type SpotifyState = {
  accessToken: string | null;
  deviceId: string | null;
  isPlayerReady: boolean;
  isPremium: boolean;
  userName: string | null;
  userAvatar: string | null;
  error: string | null;

  setAccessToken: (token: string | null) => void;
  setDeviceId: (id: string | null) => void;
  setPlayerReady: (ready: boolean) => void;
  setUserInfo: (name: string, avatar: string | null, premium: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useSpotifyStore = create<SpotifyState>((set) => ({
  accessToken: null,
  deviceId: null,
  isPlayerReady: false,
  isPremium: false,
  userName: null,
  userAvatar: null,
  error: null,

  setAccessToken: (token) => set({ accessToken: token }),
  setDeviceId: (id) => set({ deviceId: id }),
  setPlayerReady: (ready) => set({ isPlayerReady: ready }),
  setUserInfo: (name, avatar, premium) =>
    set({ userName: name, userAvatar: avatar, isPremium: premium }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      accessToken: null,
      deviceId: null,
      isPlayerReady: false,
      isPremium: false,
      userName: null,
      userAvatar: null,
      error: null,
    }),
}));
