"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type SnippetPlayerProps = {
  onSnippetEnd: () => void;
  isPlaying: boolean;
  onPlay: () => void;
};

export function SnippetPlayer({ onSnippetEnd, isPlaying, onPlay }: SnippetPlayerProps) {
  const { config, currentSnippetLevel } = useGameStore();
  const durationConfig = config.snippetDurations[currentSnippetLevel] ?? 1;
  const isFullSong = durationConfig === -1;
  const duration = isFullSong ? 0 : durationConfig; // 0 for display purposes
  const [progress, setProgress] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const animateProgress = useCallback(() => {
    if (isFullSong) {
      // For full song, just show a pulsing animation (no progress)
      setProgress(0.5);
      return;
    }
    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min(elapsed / (duration * 1000), 1);
    setProgress(pct);

    if (pct < 1) {
      animationRef.current = requestAnimationFrame(animateProgress);
    }
  }, [duration, isFullSong]);

  useEffect(() => {
    if (isPlaying) {
      setHasPlayed(true);
      startTimeRef.current = Date.now();
      setProgress(0);
      animationRef.current = requestAnimationFrame(animateProgress);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animateProgress]);

  // Reset on snippet level change
  useEffect(() => {
    setProgress(0);
    setHasPlayed(false);
  }, [currentSnippetLevel]);

  // SVG circle params - larger ring (120px radius)
  const radius = 72;
  const svgSize = 180;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Snippet level indicator - larger dots */}
      <div className="flex items-center gap-3">
        {config.snippetDurations.map((d, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < currentSnippetLevel
                ? "w-2.5 h-2.5 bg-[var(--text-muted)]"
                : i === currentSnippetLevel
                ? "w-3.5 h-3.5 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                : "w-2.5 h-2.5 bg-[var(--border-default)]"
            }`}
          />
        ))}
      </div>

      {/* Circular Timer - larger */}
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="timer-ring">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: isPlaying ? "drop-shadow(0 0 10px var(--accent))" : "none",
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {!hasPlayed ? (
            <button
              onClick={onPlay}
              className="w-20 h-20 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 shadow-lg shadow-[var(--accent)]/30"
              aria-label="Play snippet"
            >
              <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : isPlaying ? (
            <div className="text-center pulse-ring">
              <div className="text-4xl font-black text-[var(--accent)] tabular-nums">
                {isFullSong ? "♫" : `${duration}s`}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                {isFullSong ? "full song" : "playing"}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--text-muted)] tabular-nums">
                {isFullSong ? "♫" : `${duration}s`}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                {isFullSong ? "full song" : "played"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Duration label */}
      <p className="text-sm text-[var(--text-muted)]">
        Snippet {currentSnippetLevel + 1} of {config.snippetDurations.length}
        {" — "}
        <span className="text-[var(--text-secondary)] font-medium">
          {isFullSong ? "Full Song" : `${duration} second${duration !== 1 ? "s" : ""}`}
        </span>
      </p>
    </div>
  );
}
