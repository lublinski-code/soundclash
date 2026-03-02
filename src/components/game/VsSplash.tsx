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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${teamColor}15 0%, transparent 55%)`,
        }}
      />

      <div className="text-center relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div
          className={`transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <p className="font-retro uppercase tracking-[0.3em] text-[var(--text-muted)]" style={{ fontSize: '20px', lineHeight: '1.4' }}>
            Now playing
          </p>
          <h2
            className="font-retro text-6xl md:text-8xl lg:text-9xl tracking-wider"
            style={{ color: teamColor, lineHeight: '1.1' }}
          >
            {displayName}
          </h2>
          {!is1v1 && (
            <p
              className="font-retro"
              style={{ color: teamColor, fontSize: '24px', lineHeight: '1.4' }}
            >
              {activePlayer?.name ?? "Unknown"}
            </p>
          )}
        </div>

        <div className={`transition-all duration-300 ${showVs ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
          <div className="flex items-center justify-center" style={{ gap: '24px' }}>
            <div
              className="rounded-full"
              style={{
                height: '4px',
                width: '80px',
                background: `linear-gradient(90deg, transparent, ${teamColor})`,
              }}
            />
            <span
              className="font-retro vs-animate"
              style={{ fontSize: '48px', color: teamColor }}
            >
              VS
            </span>
            <div
              className="rounded-full"
              style={{
                height: '4px',
                width: '80px',
                background: `linear-gradient(90deg, ${teamColor}, transparent)`,
              }}
            />
          </div>
        </div>

        <p
          className={`font-retro text-[var(--text-muted)] transition-all duration-500 delay-500 tracking-wider ${show ? "opacity-100" : "opacity-0"}`}
          style={{ fontSize: '18px', lineHeight: '1.5' }}
        >
          Listen carefully and guess the song
        </p>
      </div>
    </div>
  );
}
