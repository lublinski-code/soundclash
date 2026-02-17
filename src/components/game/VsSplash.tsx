"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

type VsSplashProps = {
  onComplete: () => void;
};

export function VsSplash({ onComplete }: VsSplashProps) {
  const { teams, currentTeamIndex } = useGameStore();
  const [show, setShow] = useState(false);

  const activeTeam = teams[currentTeamIndex];
  const activePlayer = activeTeam.members[activeTeam.activeIndex];

  const is1v1 = teams[0].members.length === 1 && teams[1].members.length === 1;
  const displayName = is1v1
    ? activePlayer?.name ?? "Unknown"
    : activeTeam.name;

  useEffect(() => {
    const showTimer = setTimeout(() => setShow(true), 100);
    const advanceTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(advanceTimer);
    };
  }, [onComplete]);

  const teamColor = currentTeamIndex === 0 ? "var(--hp-full)" : "var(--hp-low)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center space-y-8">
        <div className={`space-y-3 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium">
            Now playing
          </p>
          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--text-primary)] tracking-tighter pulse-ring"
            style={{
              textShadow: `0 0 40px ${teamColor}40`,
            }}
          >
            {displayName}
          </h2>
          {!is1v1 && (
            <p className="text-xl font-semibold" style={{ color: teamColor }}>
              {activePlayer?.name ?? "Unknown"}
            </p>
          )}
        </div>

        <div className={`transition-all duration-300 delay-300 ${show ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
          <div className="flex items-center justify-center gap-6">
            <div
              className="h-0.5 w-24 rounded-full"
              style={{ background: teamColor }}
            />
            <span
              className="text-4xl font-black vs-animate"
              style={{ color: teamColor }}
            >
              ♫
            </span>
            <div
              className="h-0.5 w-24 rounded-full"
              style={{ background: teamColor }}
            />
          </div>
        </div>

        <p className={`text-sm text-[var(--text-muted)] transition-all duration-500 delay-500 ${show ? "opacity-100" : "opacity-0"}`}>
          Listen carefully and guess the song
        </p>
      </div>
    </div>
  );
}
