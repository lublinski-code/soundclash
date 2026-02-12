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
  const duration = config.snippetDurations[currentSnippetLevel] ?? 1;
  const [progress, setProgress] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const animateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min(elapsed / (duration * 1000), 1);
    setProgress(pct);

    if (pct < 1) {
      animationRef.current = requestAnimationFrame(animateProgress);
    }
  }, [duration]);

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

  // SVG circle params
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Snippet level indicator */}
      <div className="flex items-center gap-2">
        {config.snippetDurations.map((d, i) => (
          <div
            key={d}
            className={`w-2 h-2 rounded-full transition-all ${
              i < currentSnippetLevel
                ? "bg-[var(--text-muted)]"
                : i === currentSnippetLevel
                ? "bg-[var(--accent)] scale-125"
                : "bg-[var(--border-default)]"
            }`}
          />
        ))}
      </div>

      {/* Circular Timer */}
      <div className="relative">
        <svg width="160" height="160" className="timer-ring">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: isPlaying ? "drop-shadow(0 0 6px var(--accent))" : "none",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {!hasPlayed ? (
            <button
              onClick={onPlay}
              className="w-16 h-16 rounded-full bg-[var(--accent)] hover:bg-[#7c3aed] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Play snippet"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : isPlaying ? (
            <div className="text-center pulse-ring">
              <div className="text-3xl font-black text-[var(--accent)] tabular-nums">
                {duration}s
              </div>
              <div className="text-xs text-[var(--text-muted)]">playing</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-muted)]">
                {duration}s
              </div>
              <div className="text-xs text-[var(--text-muted)]">played</div>
            </div>
          )}
        </div>
      </div>

      {/* Duration label */}
      <p className="text-sm text-[var(--text-muted)]">
        Snippet {currentSnippetLevel + 1} of {config.snippetDurations.length}
        {" — "}
        <span className="text-[var(--text-secondary)] font-medium">{duration} second{duration !== 1 ? "s" : ""}</span>
      </p>
    </div>
  );
}
