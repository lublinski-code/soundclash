"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeamSetup } from "@/components/setup/TeamSetup";
import { GenrePicker } from "@/components/setup/GenrePicker";
import { EraPicker } from "@/components/setup/EraPicker";
import { CountryPicker } from "@/components/setup/CountryPicker";
import { GameConfigPanel } from "@/components/setup/GameConfig";
import { useGameStore } from "@/store/gameStore";
import { useSpotifyStore } from "@/store/spotifyStore";
import { buildSongPool } from "@/lib/spotify/songPool";
import { isAuthenticated, getAccessToken } from "@/lib/spotify/auth";
import { getCurrentUser } from "@/lib/spotify/api";
import { initPlayer } from "@/lib/spotify/player";

export default function SetupPage() {
  const router = useRouter();
  const { teams, config, dispatch } = useGameStore();
  const {
    isPlayerReady,
    userName,
    setAccessToken,
    setDeviceId,
    setPlayerReady,
    setUserInfo,
    setError: setSpotifyError,
  } = useSpotifyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializingPlayer, setInitializingPlayer] = useState(false);

  // If not authenticated, redirect to home
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    // If player not ready, initialize it
    if (!isPlayerReady && !initializingPlayer) {
      setInitializingPlayer(true);
      (async () => {
        try {
          const token = await getAccessToken();
          if (token) {
            setAccessToken(token);
            const user = await getCurrentUser();
            setUserInfo(
              user.display_name,
              user.images?.[0]?.url ?? null,
              user.product === "premium"
            );

            await initPlayer(
              (deviceId) => {
                setDeviceId(deviceId);
                setPlayerReady(true);
                setInitializingPlayer(false);
              },
              (err) => {
                setSpotifyError(err);
                setInitializingPlayer(false);
              }
            );
          }
        } catch {
          setInitializingPlayer(false);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerReady, initializingPlayer]);

  const canStart =
    teams[0].members.length > 0 &&
    teams[1].members.length > 0 &&
    config.genres.length > 0 &&
    isPlayerReady;

  const handleStartBattle = async () => {
    if (!canStart) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Starting song pool build with config:", config);
      const songPool = await buildSongPool(config);

      if (songPool.length < 10) {
        setError(
          `Only found ${songPool.length} songs. Try selecting different genres or removing era filters.`
        );
        setLoading(false);
        return;
      }

      dispatch({ type: "START_GAME", songPool });
      router.push("/game");
    } catch (err) {
      console.error("Song pool build failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load songs");
      setLoading(false);
    }
  };

  const validationMessages: string[] = [];
  if (teams[0].members.length === 0) validationMessages.push("Add players to Team 1");
  if (teams[1].members.length === 0) validationMessages.push("Add players to Team 2");
  if (config.genres.length === 0) validationMessages.push("Select at least one genre");
  if (!isPlayerReady && !initializingPlayer) validationMessages.push("Spotify player not ready — go back and reconnect");

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            BATTLE SETUP
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Configure your teams and game rules
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Back
        </button>
      </div>

      {/* Player status */}
      {initializingPlayer && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Initializing Spotify player...</span>
        </div>
      )}

      {isPlayerReady && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--hp-full)] border-opacity-30">
          <span className="text-[var(--hp-full)]">&#x2713;</span>
          <span className="text-sm text-[var(--text-secondary)]">Spotify player ready</span>
        </div>
      )}

      <div className="h-px bg-[var(--border-default)]" />

      {/* Teams */}
      <TeamSetup />

      <div className="h-px bg-[var(--border-default)]" />

      {/* Music Filters */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
          Music Selection
        </h2>
        <GenrePicker />
        <EraPicker />
        <CountryPicker />
      </div>

      <div className="h-px bg-[var(--border-default)]" />

      {/* Game Config */}
      <GameConfigPanel />

      <div className="h-px bg-[var(--border-default)]" />

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 pb-8">
        {validationMessages.length > 0 && (
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            {validationMessages.map((msg, i) => (
              <p key={i}>&#x2022; {msg}</p>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--flash-miss)] max-w-md text-center">{error}</p>
        )}

        <button
          onClick={handleStartBattle}
          disabled={!canStart || loading}
          className="px-16 py-4 rounded-lg bg-[var(--accent)] hover:bg-[#7c3aed] text-white font-black text-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading Songs...
            </span>
          ) : (
            "START BATTLE"
          )}
        </button>
      </div>
    </main>
  );
}
