"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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
  const pendingAutoPlayRef = useRef(false);
  const snippetStartOffsetRef = useRef<number | null>(null);

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

    const durationConfig = config.snippetDurations[currentSnippetLevel] ?? 1;
    const songDurationMs = currentSong.duration_ms;

    // -1 means full song
    const isFullSong = durationConfig === -1;
    const snippetDurationMs = isFullSong ? songDurationMs : durationConfig * 1000;

    // Calculate random start offset (only on first play, not replay)
    // For full song, start from beginning
    if (snippetStartOffsetRef.current === null) {
      if (isFullSong) {
        snippetStartOffsetRef.current = 0;
      } else {
        // Pick random position: avoid last (snippetDuration + 5s buffer) and first 2s
        const minOffset = 2000; // Skip first 2s
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
        () => setIsPlaying(false),
        snippetStartOffsetRef.current
      );
    } catch (err) {
      console.error("Playback error:", err);
      setIsPlaying(false);
    }
  }, [currentSong, isPlayerReady, config.snippetDurations, currentSnippetLevel]);

  // ── Replay current snippet ──
  const handleReplay = useCallback(async () => {
    if (!currentSong || !isPlayerReady || isPlaying) return;
    await handlePlaySnippet();
  }, [currentSong, isPlayerReady, isPlaying, handlePlaySnippet]);

  // ── Submit Guess ──
  const handleGuess = useCallback(
    async (trackId: string, trackName: string, artistNames: string[]) => {
      await stopSnippet();
      setIsPlaying(false);
      setSnippetPlayed(false);
      // Set pending auto-play in case wrong guess advances to next snippet
      pendingAutoPlayRef.current = true;
      dispatch({ type: "SUBMIT_GUESS", trackId, trackName, artistNames });
    },
    [dispatch]
  );

  // ── Skip (hear more) -- auto-plays next snippet ──
  const handleSkip = useCallback(async () => {
    await stopSnippet();
    setIsPlaying(false);
    setSnippetPlayed(false);
    pendingAutoPlayRef.current = true;
    dispatch({ type: "SKIP_GUESS" });
  }, [dispatch]);

  // ── Give Up -- max damage, reveal song ──
  const handleGiveUp = useCallback(async () => {
    await stopSnippet();
    setIsPlaying(false);
    setSnippetPlayed(false);
    dispatch({ type: "GIVE_UP" });
  }, [dispatch]);

  // ── Damage Animation Complete ──
  const handleDamageComplete = useCallback(() => {
    dispatch({ type: "SHOW_ALBUM" });
  }, [dispatch]);

  // ── Album Reveal: play full song ──
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

  // ── Album Reveal Complete ──
  const handleAlbumComplete = useCallback(async () => {
    // Pause any playing song before advancing
    if (deviceId) {
      try {
        await pausePlayback(deviceId);
      } catch {
        // ignore
      }
    }
    dispatch({ type: "END_ROUND" });
  }, [dispatch, deviceId]);

  // ── New Game (restart) ──
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

  // Reset snippet state on phase change or snippet level change
  useEffect(() => {
    if (phase === "SNIPPET") {
      setSnippetPlayed(false);
      setIsPlaying(false);
      // Reset random offset when snippet level changes (new snippet = new random position)
      snippetStartOffsetRef.current = null;
    }
  }, [phase, currentSnippetLevel]);

  // Auto-play after skip: when snippet level changes and we have a pending auto-play
  useEffect(() => {
    if (pendingAutoPlayRef.current && phase === "SNIPPET") {
      pendingAutoPlayRef.current = false;
      // Small delay to let state settle
      const timer = setTimeout(() => {
        handlePlaySnippet();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [phase, currentSnippetLevel, handlePlaySnippet]);

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
    <div className="flex-1 flex flex-col">
      {/* HP HUD — always visible during game (except KO) */}
      {phase !== "KO" && <HpHud />}

      {/* Spotify warning + New Game button */}
      {phase !== "KO" && (
        <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-2">
            <p className="text-[11px] text-[var(--text-muted)] flex-1">
              ⚠ Don&apos;t check your Spotify app — the song is visible there!
            </p>
            <button
              onClick={handleNewGame}
              className="btn-muted text-xs py-1 px-3"
            >
              ✕ End Game
            </button>
          </div>
        </div>
      )}

      {/* VS Splash */}
      {phase === "VS_SCREEN" && <VsSplash onComplete={handleVsComplete} />}

      {/* Snippet + Guess Phase */}
      {(phase === "SNIPPET" || phase === "GUESS") && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-10">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10">
            {/* Active player indicator */}
            <div className="text-center">
              {teams[0].members.length === 1 && teams[1].members.length === 1 ? (
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {teams[currentTeamIndex].members[0]?.name}&apos;s turn
                </p>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
                    {teams[currentTeamIndex].name}&apos;s turn
                  </p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {teams[currentTeamIndex].members[teams[currentTeamIndex].activeIndex]?.name}
                  </p>
                </>
              )}
            </div>

            <SnippetPlayer
              isPlaying={isPlaying}
              onPlay={handlePlaySnippet}
              onSnippetEnd={() => setIsPlaying(false)}
            />

            {/* Show guess input after snippet has played at least once */}
            {snippetPlayed && !isPlaying && (
              <div className="fade-in w-full">
                <GuessInput
                  onGuess={handleGuess}
                  onSkip={handleSkip}
                  onGiveUp={handleGiveUp}
                  onReplay={handleReplay}
                  disabled={isPlaying}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Damage Phase */}
      {phase === "DAMAGE" && lastResult && (
        <div className="flex-1">
          <DamageOverlay
            damage={lastResult.damage}
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
