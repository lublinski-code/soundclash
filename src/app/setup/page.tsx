"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeamSetup } from "@/components/setup/TeamSetup";
import { GenrePicker } from "@/components/setup/GenrePicker";
import { EraPicker } from "@/components/setup/EraPicker";
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
  const [showSettings, setShowSettings] = useState(true);

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

    if (isPlayerConnected()) {
      const did = getDeviceId();
      if (did) {
        setDeviceId(did);
        setPlayerReady(true);
      }
      return;
    }

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
      const songPool = await buildSongPool(config);

      if (songPool.length < 5) {
        setError(
          `Only found ${songPool.length} songs. Try selecting more genres or removing era filters.`
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
    <main
      className="min-h-screen flex flex-col items-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full flex flex-col items-center"
        style={{ maxWidth: "720px", padding: "24px 16px 48px" }}
      >
        {/* Header */}
        <header className="w-full" style={{ marginBottom: "24px" }}>
          <div className="flex justify-start" style={{ marginBottom: "16px" }}>
            <button
              onClick={() => router.push("/")}
              className="btn-muted cursor-pointer"
              style={{ fontSize: "12px", lineHeight: "1.5" }}
              aria-label="Back to home"
            >
              &larr; Back
            </button>
          </div>
          <h1
            className="font-display text-center"
            style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              lineHeight: 1.2,
              color: "var(--text-primary)",
            }}
          >
            Battle Setup
          </h1>
        </header>

        {/* Content */}
        <div className="w-full flex flex-col" style={{ gap: "16px" }}>
          {/* Players section */}
          <section
            className="card"
            style={{ padding: "20px 24px" }}
          >
            <TeamSetup />
          </section>

          {/* Battle Settings - collapsible */}
          <section
            className="card"
            style={{ padding: "20px 24px" }}
          >
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between cursor-pointer"
              style={{ background: "none", border: "none" }}
              aria-expanded={showSettings}
            >
              <h2
                className="text-subtitle-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Battle Settings
              </h2>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  transition: "transform 200ms ease",
                  transform: showSettings ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showSettings && (
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "20px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <GenrePicker />
                <EraPicker />
                <GameConfigPanel />
              </div>
            )}
          </section>
        </div>

        {/* Status + Start */}
        <div className="flex flex-col items-center" style={{ marginTop: "24px", gap: "12px" }}>
          {initializingPlayer && (
            <div
              className="flex items-center text-caption"
              style={{ gap: "8px", color: "var(--text-muted)" }}
            >
              <div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              Initializing player...
            </div>
          )}
          {isPlayerReady && (
            <p className="text-caption" style={{ color: "var(--success)" }}>
              Status: Ready!
            </p>
          )}

          {validationMessages.length > 0 && (
            <div
              className="text-center"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {validationMessages.map((msg, i) => (
                <p
                  key={i}
                  className="text-caption"
                  style={{ color: "var(--text-muted)" }}
                >
                  {msg}
                </p>
              ))}
            </div>
          )}

          {error && (
            <p
              className="text-body-2 text-center"
              style={{ color: "var(--destructive)", maxWidth: "400px" }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleStartBattle}
            disabled={!canStart || loading}
            className="btn-arcade disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ minWidth: "200px" }}
          >
            {loading ? (
              <span className="flex items-center" style={{ gap: "12px" }}>
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                LOADING...
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
