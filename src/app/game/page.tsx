"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSpotifyStore } from "@/store/spotifyStore";
import { HpHud } from "@/components/game/HpHud";
import { SnippetPlayer } from "@/components/game/SnippetPlayer";
import { GuessInput } from "@/components/game/GuessInput";
import { DamageOverlay } from "@/components/game/DamageOverlay";
import { AlbumReveal } from "@/components/game/AlbumReveal";
import { KoScreen } from "@/components/game/KoScreen";
import { playSnippet, stopSnippet } from "@/lib/spotify/player";
import { playTrack, pausePlayback } from "@/lib/spotify/api";

export default function GamePage() {
  const router = useRouter();
  const {
    phase,
    teams,
    config,
    songPool,
    currentSongIndex,
    currentTeamIndex,
    currentSnippetLevel,
    roundResults,
    dispatch,
  } = useGameStore();
  const { isPlayerReady, deviceId } = useSpotifyStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [snippetPlayed, setSnippetPlayed] = useState(false);
  const snippetStartOffsetRef = useRef<number | null>(null);

  // Redirect to setup if not in an active game.
  // The timeout prevents a race where the effect fires before Zustand state
  // propagates after a client-side navigation from the setup page.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "LOBBY" || songPool.length === 0) {
        router.replace("/setup");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [phase, songPool, router]);

  // Skip VS_SCREEN phase directly to SNIPPET
  useEffect(() => {
    if (phase === "VS_SCREEN") {
      dispatch({ type: "START_SNIPPET" });
    }
  }, [phase, dispatch]);

  const currentSong = songPool[currentSongIndex];
  const lastResult = roundResults[roundResults.length - 1];

  const handlePlaySnippet = useCallback(async () => {
    if (!currentSong || !isPlayerReady) return;

    const durationConfig = config.snippetDurations[currentSnippetLevel] ?? 1;
    const songDurationMs = currentSong.duration_ms;
    const isFullSong = durationConfig === -1;
    const snippetDurationMs = isFullSong ? songDurationMs : durationConfig * 1000;

    if (snippetStartOffsetRef.current === null) {
      if (isFullSong) {
        snippetStartOffsetRef.current = 0;
      } else {
        const minOffset = 2000;
        const maxOffset = Math.max(minOffset, songDurationMs - snippetDurationMs - 5000);
        snippetStartOffsetRef.current =
          minOffset + Math.floor(Math.random() * (maxOffset - minOffset));
      }
    }

    setIsPlaying(true);
    setSnippetPlayed(true);

    try {
      await playSnippet(
        currentSong.uri,
        snippetDurationMs,
        () => {
          setIsPlaying(false);
        },
        snippetStartOffsetRef.current
      );
    } catch (err) {
      console.error("[Game] Playback error:", err);
      setIsPlaying(false);
    }
  }, [currentSong, isPlayerReady, config.snippetDurations, currentSnippetLevel]);

  const handleReplay = useCallback(async () => {
    if (!currentSong || !isPlayerReady) return;
    if (isPlaying) {
      await stopSnippet();
      setIsPlaying(false);
      await new Promise((r) => setTimeout(r, 100));
    }
    await handlePlaySnippet();
  }, [currentSong, isPlayerReady, isPlaying, handlePlaySnippet]);

  const handleGuess = useCallback(
    async (trackId: string, trackName: string, artistNames: string[]) => {
      await stopSnippet();
      setIsPlaying(false);
      setSnippetPlayed(false);
      dispatch({ type: "SUBMIT_GUESS", trackId, trackName, artistNames });
    },
    [dispatch]
  );

  const handleSkip = useCallback(async () => {
    await stopSnippet();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "SKIP_GUESS" });
  }, [dispatch]);

  const handleGiveUp = useCallback(async () => {
    await stopSnippet();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "GIVE_UP" });
  }, [dispatch]);

  const handleDamageComplete = useCallback(() => {
    dispatch({ type: "SHOW_ALBUM" });
  }, [dispatch]);

  const handleAlbumPlay = useCallback(async () => {
    if (!currentSong || !deviceId) return;
    try {
      await playTrack(currentSong.uri, deviceId, 0);
    } catch (err) {
      console.error("Album playback error:", err);
    }
  }, [currentSong, deviceId]);

  const handleAlbumPause = useCallback(async () => {
    if (!deviceId) return;
    try {
      await pausePlayback(deviceId);
    } catch {
      // ignore
    }
  }, [deviceId]);

  const handleAlbumComplete = useCallback(async () => {
    if (deviceId) {
      try {
        await pausePlayback(deviceId);
      } catch {
        // ignore
      }
    }
    dispatch({ type: "END_ROUND" });
  }, [dispatch, deviceId]);

  const handleNewGame = useCallback(async () => {
    await stopSnippet();
    if (deviceId) {
      try {
        await pausePlayback(deviceId);
      } catch {
        // ignore
      }
    }
    dispatch({ type: "RESET" });
    router.push("/setup");
  }, [dispatch, router, deviceId]);

  useEffect(() => {
    if (phase === "SNIPPET") {
      setSnippetPlayed(false);
      setIsPlaying(false);
      snippetStartOffsetRef.current = null;
    }
  }, [phase, currentSnippetLevel]);

  useEffect(() => {
    if (phase === "SNIPPET" && !isPlaying) {
      const timer = setTimeout(() => {
        handlePlaySnippet();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentSnippetLevel]);

  if (!currentSong && phase !== "KO") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ color: "var(--text-muted)" }}>No more songs in the pool!</p>
          <button
            onClick={() => {
              dispatch({ type: "RESET" });
              router.push("/setup");
            }}
            className="btn-primary cursor-pointer"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const albumArtUrl = currentSong?.album?.images?.[0]?.url;
  const canSkip = currentSnippetLevel < config.snippetDurations.length - 1;

  const playerTurnLabel =
    teams[0].members.length === 1 && teams[1].members.length === 1
      ? `${teams[currentTeamIndex].members[0]?.name ?? "Player"}'s turn`
      : `${teams[currentTeamIndex].name}'s turn`;

  return (
    <div className="flex-1 flex flex-col relative" style={{ minHeight: "100dvh" }}>
      {/* Blurred album art background */}
      {albumArtUrl && (phase === "SNIPPET" || phase === "GUESS") && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${albumArtUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px) brightness(0.18) saturate(1.4)",
            transform: "scale(1.2)",
          }}
          aria-hidden="true"
        />
      )}

      {/* End Game button — absolute top-right */}
      {phase !== "KO" && (
        <button
          onClick={handleNewGame}
          className="absolute z-20 flex items-center cursor-pointer transition-colors"
          style={{
            top: "16px",
            right: "24px",
            gap: "8px",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.02em",
            padding: "8px 12px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          aria-label="End game"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          End Game
        </button>
      )}

      {/* HP HUD */}
      {phase !== "KO" && <HpHud />}

      {/* Snippet + Guess Phase */}
      {(phase === "SNIPPET" || phase === "GUESS") && (
        <div
          className="flex-1 flex flex-col items-center relative z-10"
          style={{ padding: "0 24px 32px" }}
        >
          {/* Player turn label */}
          <div
            className="text-center"
            style={{ paddingTop: "clamp(24px, 4vh, 48px)", marginBottom: "clamp(16px, 3vh, 32px)" }}
          >
            <p
              className="font-display"
              style={{
                fontSize: "clamp(18px, 3vw, 24px)",
                lineHeight: 1.3,
                color: "var(--text-primary)",
              }}
            >
              {playerTurnLabel}
            </p>
          </div>

          {/* Timer (with album art bloom behind it) */}
          <div className="relative flex items-center justify-center" style={{ marginBottom: "clamp(16px, 3vh, 28px)" }}>
            {albumArtUrl && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: "220px",
                  height: "220px",
                  backgroundImage: `url(${albumArtUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "50%",
                  filter: "blur(40px) brightness(0.5) saturate(1.6)",
                  transform: "scale(1.3)",
                  opacity: 0.8,
                }}
                aria-hidden="true"
              />
            )}
            <SnippetPlayer
              isPlaying={isPlaying}
              onPlay={handleReplay}
              onSnippetEnd={() => setIsPlaying(false)}
            />
          </div>

          {/* Input area — shown after first snippet plays */}
          {snippetPlayed ? (
            <div className="fade-in w-full flex flex-col items-center" style={{ gap: "0", maxWidth: "640px" }}>
              <GuessInput
                onGuess={handleGuess}
                onGiveUp={handleGiveUp}
                onSkip={canSkip ? handleSkip : undefined}
                canSkip={canSkip}
                disabled={false}
              />
            </div>
          ) : (
            <p className="text-body-2" style={{ color: "var(--text-muted)" }}>
              Listen carefully and guess the song
            </p>
          )}
        </div>
      )}

      {/* Damage Phase */}
      {phase === "DAMAGE" && lastResult && (
        <div className="flex-1">
          <DamageOverlay
            damage={lastResult.damage}
            artistOnly={lastResult.artistOnly}
            onComplete={handleDamageComplete}
          />
        </div>
      )}

      {/* Album Reveal */}
      {phase === "ALBUM_REVEAL" && lastResult && (
        <AlbumReveal
          albumArt={lastResult.albumArt}
          trackName={lastResult.trackName}
          artistName={lastResult.artistName}
          onComplete={handleAlbumComplete}
          onPlay={handleAlbumPlay}
          onPause={handleAlbumPause}
        />
      )}

      {/* KO Screen */}
      {phase === "KO" && <KoScreen />}
    </div>
  );
}
