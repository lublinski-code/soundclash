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
        }, 16);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration, isFullSong]);

  useEffect(() => {
    setProgress(0);
    setHasPlayed(false);
  }, [currentSnippetLevel]);

  const radius = 50;
  const svgSize = 128;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const showPlayButton = !isPlaying && hasPlayed;

  return (
    <div className="flex flex-col items-center" style={{ gap: "20px" }}>
      {/* Circular Timer */}
      <div className="relative">
        <svg width={svgSize} height={svgSize} className="timer-ring">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="4"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              opacity: isPlaying ? 1 : 0.3,
              transition: "stroke-dashoffset 0.1s linear",
            }}
          />
        </svg>

        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            width: "92px",
            height: "92px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--bg-secondary)",
            borderRadius: "50%",
          }}
        >
          {isPlaying ? (
            <span
              className="font-display tabular-nums"
              style={{ fontSize: "26px", color: "var(--accent)" }}
            >
              {isFullSong ? "♫" : `${duration}s`}
            </span>
          ) : showPlayButton ? (
            <button
              onClick={onPlay}
              className="rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer"
              style={{
                width: "56px",
                height: "56px",
                background: "transparent",
                border: "none",
              }}
              aria-label="Replay snippet"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--accent)">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <span
              className="font-display tabular-nums"
              style={{ fontSize: "26px", color: "var(--text-muted)" }}
            >
              {isFullSong ? "♫" : `${duration}s`}
            </span>
          )}
        </div>
      </div>

      {/* Snippet level dots — wide pills matching Figma */}
      <div className="flex items-center" style={{ gap: "7px" }}>
        {config.snippetDurations.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: "40px",
              height: "8px",
              backgroundColor:
                i < currentSnippetLevel
                  ? "var(--text-muted)"
                  : i === currentSnippetLevel
                  ? "var(--accent)"
                  : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
