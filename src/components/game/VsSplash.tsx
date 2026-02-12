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

  useEffect(() => {
    // Trigger animation
    const showTimer = setTimeout(() => setShow(true), 100);
    // Auto-advance after 2.5 seconds
    const advanceTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(advanceTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center space-y-6">
        {/* Active team highlight */}
        <div className={`space-y-2 transition-all duration-500 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-sm uppercase tracking-widest text-[var(--text-muted)]">
            Now playing
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter">
            {activeTeam.name}
          </h2>
          <p className="text-lg text-[var(--accent)]">
            {activePlayer?.name ?? "Unknown"}
          </p>
        </div>

        {/* VS divider */}
        <div className={`transition-all duration-300 delay-300 ${show ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px w-20"
              style={{
                background: currentTeamIndex === 0
                  ? "var(--hp-full)"
                  : "var(--hp-low)",
              }}
            />
            <span className="text-3xl font-black vs-animate" style={{
              color: currentTeamIndex === 0 ? "var(--hp-full)" : "var(--hp-low)"
            }}>
              &#x266B;
            </span>
            <div
              className="h-px w-20"
              style={{
                background: currentTeamIndex === 0
                  ? "var(--hp-full)"
                  : "var(--hp-low)",
              }}
            />
          </div>
        </div>

        {/* Snippet hint */}
        <p className={`text-xs text-[var(--text-muted)] transition-all duration-500 delay-500 ${show ? "opacity-100" : "opacity-0"}`}>
          Listen carefully and guess the song
        </p>
      </div>
    </div>
  );
}
