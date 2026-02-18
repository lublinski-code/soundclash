"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

type SnippetPlayerProps = {
  onSnippetEnd: () => void;
  isPlaying: boolean;
  onPlay: () => void;
};

export function SnippetPlayer({ isPlaying, onPlay }: SnippetPlayerProps) {
  const { config, currentSnippetLevel } = useGameStore();
  const durationConfig = config.snippetDurations[currentSnippetLevel] ?? 1;
  const isFullSong = durationConfig === -1;
  const duration = isFullSong ? 0 : durationConfig;
  const [progress, setProgress] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isPlaying) {
      setHasPlayed(true);
      startTimeRef.current = Date.now();
      setProgress(0);

      if (isFullSong) {
        setProgress(0.5);
      } else {
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTimeRef.current;
          const pct = Math.min(elapsed / (duration * 1000), 1);
          setProgress(pct);
          if (pct >= 1 && intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }, 16); // ~60fps
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration, isFullSong]);

  // Reset on snippet level change
  useEffect(() => {
    setProgress(0);
    setHasPlayed(false);
  }, [currentSnippetLevel]);

  // SVG circle params
  const radius = 72;
  const svgSize = 180;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Snippet level indicator - neon dots */}
      <div className="flex items-center gap-3">
        {config.snippetDurations.map((d, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < currentSnippetLevel
                ? "w-2.5 h-2.5 bg-[var(--text-muted)]"
                : i === currentSnippetLevel
                ? "w-4 h-4 bg-[var(--accent)]"
                : "w-2.5 h-2.5 bg-[var(--border-default)]"
            }`}
            style={{
              boxShadow: i === currentSnippetLevel ? "0 0 10px var(--accent), 0 0 20px var(--accent)" : "none",
            }}
          />
        ))}
      </div>

      {/* Circular Timer - neon ring */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: isPlaying ? "0 0 30px var(--accent-glow), 0 0 60px var(--accent-dim)" : "none",
            transition: "box-shadow 0.3s ease-out",
          }}
        />

        <svg width={svgSize} height={svgSize} className={`timer-ring ${isPlaying ? "neon-ring-pulse" : ""}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--bg-surface)"
            strokeWidth="8"
          />
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--neon-pink)" />
              <stop offset="100%" stopColor="var(--neon-cyan)" />
            </linearGradient>
          </defs>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#timerGradient)"
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
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cta))",
                boxShadow: "0 0 20px var(--accent-glow), 0 4px 15px rgba(0,0,0,0.3)",
              }}
              aria-label="Play snippet"
            >
              <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : isPlaying ? (
            <div className="text-center pulse-ring">
              <div className="font-retro text-5xl text-[var(--accent)] tabular-nums neon-glow-accent">
                {isFullSong ? "♫" : `${duration}s`}
              </div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                {isFullSong ? "full song" : "playing"}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="font-retro text-4xl text-[var(--text-muted)] tabular-nums">
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
        <span className="text-[var(--accent)] font-medium">
          {isFullSong ? "Full Song" : `${duration} second${duration !== 1 ? "s" : ""}`}
        </span>
      </p>
    </div>
  );
}
