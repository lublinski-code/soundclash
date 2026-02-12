"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useSpotifyStore } from "@/store/spotifyStore";
import { HpHud } from "@/components/game/HpHud";
import { VsSplash } from "@/components/game/VsSplash";
import { SnippetPlayer } from "@/components/game/SnippetPlayer";
import { GuessInput } from "@/components/game/GuessInput";
import { DamageOverlay } from "@/components/game/DamageOverlay";
import { AlbumReveal } from "@/components/game/AlbumReveal";
import { KoScreen } from "@/components/game/KoScreen";
import { playSnippet, stopSnippet } from "@/lib/spotify/player";

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
  const { isPlayerReady } = useSpotifyStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [snippetPlayed, setSnippetPlayed] = useState(false);

  // Redirect if no game in progress
  useEffect(() => {
    if (phase === "LOBBY" || songPool.length === 0) {
      router.replace("/setup");
    }
  }, [phase, songPool, router]);

  const currentSong = songPool[currentSongIndex];
  const lastResult = roundResults[roundResults.length - 1];

  // ── VS Screen Complete ──
  const handleVsComplete = useCallback(() => {
    dispatch({ type: "START_SNIPPET" });
  }, [dispatch]);

  // ── Play Snippet ──
  const handlePlaySnippet = useCallback(async () => {
    if (!currentSong || !isPlayerReady) return;

    const duration = config.snippetDurations[currentSnippetLevel] ?? 1;
    setIsPlaying(true);
    setSnippetPlayed(true);

    try {
      await playSnippet(currentSong.uri, duration * 1000, () => {
        setIsPlaying(false);
      });
    } catch (err) {
      console.error("Playback error:", err);
      setIsPlaying(false);
    }
  }, [currentSong, isPlayerReady, config.snippetDurations, currentSnippetLevel]);

  // ── Submit Guess ──
  const handleGuess = useCallback(
    async (trackId: string) => {
      await stopSnippet();
      setIsPlaying(false);
      setSnippetPlayed(false);
      dispatch({ type: "SUBMIT_GUESS", trackId });
    },
    [dispatch]
  );

  // ── Skip (hear more) ──
  const handleSkip = useCallback(async () => {
    await stopSnippet();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "SKIP_GUESS" });
  }, [dispatch]);

  // ── Damage Animation Complete ──
  const handleDamageComplete = useCallback(() => {
    dispatch({ type: "SHOW_ALBUM" });
  }, [dispatch]);

  // ── Album Reveal Complete ──
  const handleAlbumComplete = useCallback(() => {
    dispatch({ type: "END_ROUND" });
  }, [dispatch]);

  // Reset snippet state on phase change
  useEffect(() => {
    if (phase === "SNIPPET") {
      setSnippetPlayed(false);
      setIsPlaying(false);
    }
  }, [phase, currentSnippetLevel]);

  // ── Render by Phase ──
  if (!currentSong && phase !== "KO") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--text-muted)]">No more songs in the pool!</p>
          <button
            onClick={() => {
              dispatch({ type: "RESET" });
              router.push("/setup");
            }}
            className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white font-bold"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* HP HUD — always visible during game (except KO) */}
      {phase !== "KO" && <HpHud />}

      {/* VS Splash */}
      {phase === "VS_SCREEN" && <VsSplash onComplete={handleVsComplete} />}

      {/* Snippet + Guess Phase */}
      {(phase === "SNIPPET" || phase === "GUESS") && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          {/* Active team indicator */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              {teams[currentTeamIndex].name}&apos;s turn
            </p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {teams[currentTeamIndex].members[teams[currentTeamIndex].activeIndex]?.name}
            </p>
          </div>

          <SnippetPlayer
            isPlaying={isPlaying}
            onPlay={handlePlaySnippet}
            onSnippetEnd={() => setIsPlaying(false)}
          />

          {/* Only show guess input after snippet has played at least once */}
          {snippetPlayed && !isPlaying && (
            <div className="fade-in w-full">
              <GuessInput
                onGuess={handleGuess}
                onSkip={handleSkip}
                disabled={isPlaying}
              />
            </div>
          )}
        </div>
      )}

      {/* Damage Phase */}
      {phase === "DAMAGE" && lastResult && (
        <div className="flex-1">
          <DamageOverlay
            damage={lastResult.damage}
            correct={lastResult.correct}
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
        />
      )}

      {/* KO Screen */}
      {phase === "KO" && <KoScreen />}
    </div>
  );
}
