"use client";

import { useEffect, useState } from "react";
import { extractDominantColor, createGlow } from "@/lib/utils/colorExtract";

type AlbumRevealProps = {
  albumArt: string;
  trackName: string;
  artistName: string;
  onComplete: () => void;
  onPlay?: () => void;
  onPause?: () => void;
};

export function AlbumReveal({
  albumArt,
  trackName,
  artistName,
  onComplete,
  onPlay,
  onPause,
}: AlbumRevealProps) {
  const [dominantColor, setDominantColor] = useState<string>("rgb(168, 85, 247)");
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (albumArt) {
      extractDominantColor(albumArt)
        .then(setDominantColor)
        .catch(() => {});
    }

    const showTimer = setTimeout(() => setShow(true), 100);

    // Auto-start full song playback after reveal animation
    const playTimer = setTimeout(() => {
      onPlay?.();
      setPlaying(true);
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(playTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumArt]);

  const glow = createGlow(dominantColor, 1.5);

  const handleTogglePlay = () => {
    if (playing) {
      onPause?.();
      setPlaying(false);
    } else {
      onPlay?.();
      setPlaying(true);
    }
  };

  const handleNextRound = () => {
    onPause?.();
    setPlaying(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] bg-opacity-95">
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${dominantColor}30 0%, transparent 50%)`,
        }}
      />

      <div
        className={`text-center space-y-8 px-6 max-w-2xl mx-auto transition-all duration-700 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Album Art - vinyl record aesthetic */}
        <div className="relative inline-block">
          {/* Outer glow */}
          <div
            className="absolute -inset-4 rounded-[var(--radius-xl)] blur-3xl opacity-50"
            style={{ backgroundColor: dominantColor }}
          />

          {/* Neon border ring */}
          <div
            className="absolute -inset-1 rounded-[var(--radius-xl)] opacity-80"
            style={{
              background: `linear-gradient(135deg, ${dominantColor}, var(--accent), var(--neon-pink))`,
              padding: "2px",
            }}
          />

          <img
            src={albumArt}
            alt={`${trackName} album art`}
            className="album-reveal relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[var(--radius-xl)] object-cover"
            style={{
              boxShadow: glow,
            }}
          />

          {/* Playing indicator */}
          {playing && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-1 bg-[var(--accent)] rounded-full animate-pulse" style={{ height: "60%", animationDelay: "0ms" }} />
                <div className="w-1 bg-[var(--accent)] rounded-full animate-pulse" style={{ height: "100%", animationDelay: "150ms" }} />
                <div className="w-1 bg-[var(--accent)] rounded-full animate-pulse" style={{ height: "40%", animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-[var(--text-primary)]">Playing</span>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="space-y-3 fade-in max-w-md mx-auto" style={{ animationDelay: "0.4s" }}>
          <h3
            className="font-retro text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] leading-tight tracking-wider neon-glow-sm"
            style={{
              textShadow: `0 0 30px ${dominantColor}`,
            }}
          >
            {trackName}
          </h3>
          <p className="text-lg md:text-xl text-[var(--text-secondary)]">{artistName}</p>
        </div>

        {/* Playback Controls */}
        <div
          className="flex items-center justify-center gap-4 fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          {/* Play / Pause */}
          <button
            onClick={handleTogglePlay}
            className="btn-icon w-14 h-14 cursor-pointer"
            aria-label={playing ? "Pause" : "Play"}
            style={{
              borderColor: dominantColor,
              color: dominantColor,
            }}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Round */}
          <button
            onClick={handleNextRound}
            className="btn-arcade cursor-pointer"
          >
            Next Round →
          </button>
        </div>
      </div>
    </div>
  );
}
