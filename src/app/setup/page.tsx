"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeamSetup } from "@/components/setup/TeamSetup";
import { GenrePicker } from "@/components/setup/GenrePicker";
import { CountryPicker } from "@/components/setup/CountryPicker";
import { GameConfigPanel } from "@/components/setup/GameConfig";
import { useGameStore } from "@/store/gameStore";
import { useSpotifyStore } from "@/store/spotifyStore";
import { buildSongPool } from "@/lib/spotify/songPool";
import { isAuthenticated, getAccessToken } from "@/lib/spotify/auth";
import { getCurrentUser } from "@/lib/spotify/api";
import { initPlayer, isPlayerConnected, getDeviceId } from "@/lib/spotify/player";
import { getRandomGenres } from "@/lib/game/constants";

export default function SetupPage() {
  const router = useRouter();
  const { teams, config, dispatch, setConfig } = useGameStore();
  const {
    isPlayerReady,
    setAccessToken,
    setDeviceId,
    setPlayerReady,
    setUserInfo,
    setError: setSpotifyError,
  } = useSpotifyStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializingPlayer, setInitializingPlayer] = useState(false);

  // Set random genre default on client-side only (avoids hydration mismatch)
  useEffect(() => {
    if (config.genres.length === 0) {
      setConfig({ genres: getRandomGenres(1) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }

    // Singleton: already connected, just sync the store
    if (isPlayerConnected()) {
      const did = getDeviceId();
      if (did) {
        setDeviceId(did);
        setPlayerReady(true);
      }
      return;
    }

    // Not ready and not already trying to init
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
          `Only found ${songPool.length} songs. Try selecting different genres.`
        );
        setLoading(false);
        return;
      }

      dispatch({ type: "START_GAME", songPool });
      router.push("/game");
    } catch (err) {
      console.error("Song pool build failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to load songs";
      if (msg.includes("401") || msg.includes("expired") || msg.includes("Not authenticated")) {
        setError("Spotify session expired. Please go back and reconnect.");
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  const validationMessages: string[] = [];
  if (teams[0].members.length === 0) validationMessages.push("Add players to Team 1");
  if (teams[1].members.length === 0) validationMessages.push("Add players to Team 2");
  if (config.genres.length === 0) validationMessages.push("Select at least one genre");
  if (!isPlayerReady && !initializingPlayer) validationMessages.push("Spotify player not ready — go back and reconnect");

  return (
    <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            BATTLE SETUP
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Configure your match and hit start
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="btn-muted"
        >
          ← Back
        </button>
      </div>

      {/* Player status */}
      {initializingPlayer && (
        <div className="card flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Initializing Spotify player...</span>
        </div>
      )}

      {isPlayerReady && (
        <div className="card flex items-center gap-2" style={{ borderColor: 'var(--hp-full)', borderWidth: '1px' }}>
          <span className="text-[var(--hp-full)]">✓</span>
          <span className="text-sm text-[var(--text-secondary)]">Spotify player ready</span>
        </div>
      )}

      {/* Teams Card */}
      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Players
        </h2>
        <TeamSetup />
      </div>

      {/* Music Selection Card */}
      <div className="card space-y-6">
        <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Music Selection
        </h2>
        <GenrePicker />
        <div className="h-px bg-[var(--border-subtle)]" />
        <CountryPicker />
      </div>

      {/* Game Config Card */}
      <div className="card">
        <GameConfigPanel />
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 pt-4 pb-8">
        {validationMessages.length > 0 && (
          <div className="text-xs text-[var(--text-muted)] space-y-1 text-center">
            {validationMessages.map((msg, i) => (
              <p key={i}>• {msg}</p>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--flash-miss)] max-w-md text-center">{error}</p>
        )}

        <button
          onClick={handleStartBattle}
          disabled={!canStart || loading}
          className="btn-primary px-16 py-4 text-lg font-black uppercase tracking-wider hover:scale-105 active:scale-95 disabled:hover:scale-100"
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
