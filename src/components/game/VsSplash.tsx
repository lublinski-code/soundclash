"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

type VsSplashProps = {
  onComplete: () => void;
};

export function VsSplash({ onComplete }: VsSplashProps) {
  const { teams, currentTeamIndex } = useGameStore();
  const [show, setShow] = useState(false);
  const [showVs, setShowVs] = useState(false);

  const activeTeam = teams[currentTeamIndex];
  const activePlayer = activeTeam.members[activeTeam.activeIndex];

  const is1v1 = teams[0].members.length === 1 && teams[1].members.length === 1;
  const displayName = is1v1
    ? activePlayer?.name ?? "Unknown"
    : activeTeam.name;

  useEffect(() => {
    const showTimer = setTimeout(() => setShow(true), 100);
    const vsTimer = setTimeout(() => setShowVs(true), 400);
    const advanceTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(vsTimer);
      clearTimeout(advanceTimer);
    };
  }, [onComplete]);

  const teamColor = currentTeamIndex === 0 ? "var(--hp-full)" : "var(--hp-low)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
      {/* Scanline overlay for extra retro feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)",
        }}
      />

      {/* Radial glow behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${teamColor}20 0%, transparent 50%)`,
        }}
      />

      <div className="text-center space-y-8 relative z-10">
        <div className={`space-y-3 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="font-retro text-xl uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Now playing
          </p>
          <h2
            className="font-retro text-6xl md:text-8xl lg:text-9xl text-[var(--text-primary)] tracking-wider neon-pulse"
            style={{
              color: teamColor,
              textShadow: `0 0 20px ${teamColor}, 0 0 40px ${teamColor}, 0 0 60px ${teamColor}`,
            }}
          >
            {displayName}
          </h2>
          {!is1v1 && (
            <p
              className="font-retro text-2xl neon-glow-sm"
              style={{ color: teamColor }}
            >
              {activePlayer?.name ?? "Unknown"}
            </p>
          )}
        </div>

        <div className={`transition-all duration-300 ${showVs ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
          <div className="flex items-center justify-center gap-6">
            <div
              className="h-1 w-28 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${teamColor})`,
                boxShadow: `0 0 10px ${teamColor}`,
              }}
            />
            <span
              className="font-retro text-5xl vs-animate glitch-hover"
              style={{
                color: teamColor,
                textShadow: `0 0 20px ${teamColor}, 0 0 40px ${teamColor}`,
              }}
            >
              ♫
            </span>
            <div
              className="h-1 w-28 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${teamColor}, transparent)`,
                boxShadow: `0 0 10px ${teamColor}`,
              }}
            />
          </div>
        </div>

        <p className={`font-retro text-lg text-[var(--text-muted)] transition-all duration-500 delay-500 tracking-wider ${show ? "opacity-100" : "opacity-0"}`}>
          Listen carefully and guess the song
        </p>
      </div>
    </div>
  );
}
