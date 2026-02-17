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
  const [dominantColor, setDominantColor] = useState<string>("rgb(139, 92, 246)");
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

  const glow = createGlow(dominantColor, 1.2);

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
      <div
        className={`text-center space-y-8 px-4 transition-all duration-700 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Album Art - larger */}
        <div className="relative inline-block">
          {/* Glow behind */}
          <div
            className="absolute inset-0 rounded-[var(--radius-xl)] blur-3xl opacity-60 scale-110"
            style={{ backgroundColor: dominantColor }}
          />
          <img
            src={albumArt}
            alt={`${trackName} album art`}
            className="album-reveal relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[var(--radius-xl)] object-cover"
            style={{
              boxShadow: glow,
            }}
          />
        </div>

        {/* Track Info */}
        <div className="space-y-3 fade-in max-w-md mx-auto" style={{ animationDelay: "0.4s" }}>
          <h3
            className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-primary)] leading-tight"
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
            className="btn-icon w-14 h-14"
            aria-label={playing ? "Pause" : "Play"}
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
            className="btn-primary px-10 text-base"
          >
            Next Round →
          </button>
        </div>
      </div>
    </div>
  );
}
