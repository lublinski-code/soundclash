"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { HpHud } from "@/components/game/HpHud";
import { SnippetPlayer } from "@/components/game/SnippetPlayer";
import { GuessInput } from "@/components/game/GuessInput";
import { DamageOverlay } from "@/components/game/DamageOverlay";
import { AlbumReveal } from "@/components/game/AlbumReveal";
import { KoScreen } from "@/components/game/KoScreen";
import { playPreview, stopPreview } from "@/lib/spotify/player";
import { replenishPool } from "@/lib/spotify/songPool";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [snippetPlayed, setSnippetPlayed] = useState(false);
  const snippetStartOffsetRef = useRef<number | null>(null);
  const replenishingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "LOBBY") {
        router.replace("/setup");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [phase, router]);

  // Auto-replenish pool when running low (5 songs left)
  useEffect(() => {
    const songsRemaining = songPool.length - currentSongIndex;
    if (songsRemaining > 5 || replenishingRef.current || phase === "KO" || phase === "LOBBY") return;

    replenishingRef.current = true;
    console.log(`[Game] Pool running low (${songsRemaining} left), replenishing...`);

    replenishPool(config, songPool)
      .then((newSongs) => {
        if (newSongs.length > 0) {
          useGameStore.getState().dispatch({ type: "ADD_SONGS", songs: newSongs });
          console.log(`[Game] Replenished pool with ${newSongs.length} songs`);
        }
      })
      .catch((err) => console.warn("[Game] Replenish failed:", err))
      .finally(() => {
        replenishingRef.current = false;
      });
  }, [songPool, currentSongIndex, config, phase]);

  useEffect(() => {
    if (phase === "VS_SCREEN") {
      dispatch({ type: "START_SNIPPET" });
    }
  }, [phase, dispatch]);

  const currentSong = songPool[currentSongIndex];
  const lastResult = roundResults[roundResults.length - 1];

  const handlePlaySnippet = useCallback(async () => {
    if (!currentSong?.previewUrl) return;

    const durationConfig = config.snippetDurations[currentSnippetLevel] ?? 1;
    const previewDurationMs = 30_000;
    const isFullPreview = durationConfig === -1;
    const snippetDurationMs = isFullPreview ? previewDurationMs : durationConfig * 1000;

    if (snippetStartOffsetRef.current === null) {
      if (isFullPreview) {
        snippetStartOffsetRef.current = 0;
      } else {
        const maxOffset = Math.max(0, previewDurationMs - snippetDurationMs - 2000);
        snippetStartOffsetRef.current = Math.floor(Math.random() * maxOffset);
      }
    }

    setIsPlaying(true);
    setSnippetPlayed(true);

    try {
      await playPreview(
        currentSong.previewUrl,
        snippetDurationMs,
        () => setIsPlaying(false),
        snippetStartOffsetRef.current
      );
    } catch (err) {
      console.error("[Game] Playback error:", err);
      setIsPlaying(false);
    }
  }, [currentSong, config.snippetDurations, currentSnippetLevel]);

  const handleReplay = useCallback(async () => {
    if (!currentSong?.previewUrl) return;
    if (isPlaying) {
      stopPreview();
      setIsPlaying(false);
      await new Promise((r) => setTimeout(r, 100));
    }
    await handlePlaySnippet();
  }, [currentSong, isPlaying, handlePlaySnippet]);

  const handleGuess = useCallback(
    async (trackId: string, trackName: string, artistNames: string[]) => {
      stopPreview();
      setIsPlaying(false);
      setSnippetPlayed(false);
      dispatch({ type: "SUBMIT_GUESS", trackId, trackName, artistNames });
    },
    [dispatch]
  );

  const handleSkip = useCallback(async () => {
    stopPreview();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "SKIP_GUESS" });
  }, [dispatch]);

  const handleGiveUp = useCallback(async () => {
    stopPreview();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "GIVE_UP" });
  }, [dispatch]);

  const handleDamageComplete = useCallback(() => {
    dispatch({ type: "SHOW_ALBUM" });
  }, [dispatch]);

  const handleAlbumPlay = useCallback(async () => {
    if (!currentSong?.previewUrl) return;
    try {
      await playPreview(currentSong.previewUrl, 30_000);
    } catch (err) {
      console.error("Album playback error:", err);
    }
  }, [currentSong]);

  const handleAlbumPause = useCallback(() => {
    stopPreview();
  }, []);

  const handleAlbumComplete = useCallback(() => {
    stopPreview();
    dispatch({ type: "END_ROUND" });
  }, [dispatch]);

  const handleNewGame = useCallback(() => {
    stopPreview();
    dispatch({ type: "RESET" });
    router.push("/setup");
  }, [dispatch, router]);

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

  const [poolExhausted, setPoolExhausted] = useState(false);
  const retryingRef = useRef(false);

  useEffect(() => {
    if (currentSong || phase === "KO" || phase === "LOBBY") {
      setPoolExhausted(false);
      return;
    }

    if (retryingRef.current) return;
    retryingRef.current = true;

    console.log("[Game] No current song, attempting emergency replenish...");
    replenishPool(config, songPool)
      .then((newSongs) => {
        if (newSongs.length > 0) {
          useGameStore.getState().dispatch({ type: "ADD_SONGS", songs: newSongs });
          console.log(`[Game] Emergency replenish: ${newSongs.length} songs`);
        } else {
          setPoolExhausted(true);
        }
      })
      .catch(() => setPoolExhausted(true))
      .finally(() => {
        retryingRef.current = false;
      });
  }, [currentSong, phase, config, songPool]);

  if (!currentSong && phase !== "KO") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {poolExhausted ? (
            <>
              <p style={{ color: "var(--text-muted)" }}>Could not find more songs for this combination.</p>
              <button
                onClick={() => {
                  dispatch({ type: "RESET" });
                  router.push("/setup");
                }}
                className="btn-primary cursor-pointer"
              >
                Back to Setup
              </button>
            </>
          ) : (
            <>
              <span className="w-6 h-6 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p style={{ color: "var(--text-muted)" }}>Loading more songs...</p>
            </>
          )}
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

      {/* End Game button */}
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

          {/* Timer */}
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

          {/* Input area */}
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
            correct={lastResult.correct}
            artistOnly={lastResult.artistOnly}
            targetName={
              lastResult.targetTeamId === lastResult.teamId
                ? "You"
                : (teams.find((t) => t.id === lastResult.targetTeamId)?.name ?? "Opponent")
            }
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
          spotifyUrl={currentSong?.spotifyUrl}
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
