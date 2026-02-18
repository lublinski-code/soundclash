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
    <main className="flex-1 flex flex-col">
      {/* Container with max-width and center alignment */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-retro text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider neon-glow-sm">
              BATTLE <span className="text-[var(--accent)]">SETUP</span>
            </h1>
            <div className="pixel-divider w-32 mt-3" />
            <p className="text-sm text-[var(--text-muted)] mt-4">
              Configure your match and hit start
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="btn-muted cursor-pointer self-start md:self-auto"
          >
            ← Back
          </button>
        </header>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Player status */}
          {initializingPlayer && (
            <div className="card-glow flex items-center gap-3 p-5">
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--text-muted)]">Initializing Spotify player...</span>
            </div>
          )}

          {isPlayerReady && (
            <div
              className="card flex items-center gap-3 p-5"
              style={{ borderColor: 'var(--hp-full)', borderWidth: '1px', boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)' }}
            >
              <span className="text-[var(--hp-full)] text-xl">✓</span>
              <span className="text-sm text-[var(--text-secondary)]">Spotify player ready</span>
            </div>
          )}

          {/* Teams Card */}
          <section className="card p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[var(--neon-cyan)] text-2xl">👥</span>
              <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Players
              </h2>
            </div>
            <TeamSetup />
          </section>

          {/* Music Selection Card */}
          <section className="card p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-[var(--neon-pink)] text-2xl">🎵</span>
              <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Music Selection
              </h2>
            </div>
            <GenrePicker />
            <div className="pixel-divider opacity-30" />
            <CountryPicker />
          </section>

          {/* Game Config Card */}
          <section className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[var(--neon-yellow)] text-2xl">⚙️</span>
              <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Battle Settings
              </h2>
            </div>
            <GameConfigPanel />
          </section>
        </div>

        {/* Start Button Section */}
        <div className="flex flex-col items-center gap-5 pt-12 pb-8">
          {validationMessages.length > 0 && (
            <div className="text-xs text-[var(--text-muted)] space-y-1.5 text-center">
              {validationMessages.map((msg, i) => (
                <p key={i}>• {msg}</p>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-[var(--flash-miss)] neon-glow-sm max-w-md text-center">{error}</p>
          )}

          <button
            onClick={handleStartBattle}
            disabled={!canStart || loading}
            className="btn-arcade disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
      </div>
    </main>
  );
}
