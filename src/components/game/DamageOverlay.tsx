"use client";

import { useEffect, useMemo } from "react";
import { getDamageLabel } from "@/lib/game/damage";

type DamageOverlayProps = {
  damage: number;
  onComplete: () => void;
};

// Generate random confetti particles with neon colors
function generateConfetti(count: number) {
  const neonColors = [
    "#a855f7", // accent purple
    "#22d3ee", // neon cyan
    "#f472b6", // neon pink
    "#fde047", // neon yellow
    "#4ade80", // neon green
    "#ffffff", // white
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: neonColors[Math.floor(Math.random() * neonColors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
}

export function DamageOverlay({ damage, onComplete }: DamageOverlayProps) {
  const label = getDamageLabel(damage);
  const isCorrect = label === "PERFECT" || label === "HIT";

  // Generate confetti only for correct guesses
  const confetti = useMemo(
    () => (isCorrect ? generateConfetti(label === "PERFECT" ? 50 : 30) : []),
    [isCorrect, label]
  );

  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const flashClass =
    label === "PERFECT" ? "flash-perfect" : label === "HIT" ? "flash-hit" : "flash-miss";

  const textColor =
    label === "PERFECT"
      ? "var(--flash-perfect)"
      : label === "HIT"
      ? "var(--flash-hit)"
      : "var(--flash-miss)";

  return (
    <>
      {/* Full-screen flash */}
      <div className={`fixed inset-0 z-40 pointer-events-none ${flashClass}`} />

      {/* Screen shake for miss */}
      {label === "MISS" && (
        <div className="fixed inset-0 z-30 pointer-events-none screen-shake" />
      )}

      {/* Confetti celebration for correct guesses */}
      {isCorrect && (
        <div className="fixed inset-0 z-45 pointer-events-none overflow-hidden">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="absolute confetti-particle"
              style={{
                left: `${c.left}%`,
                top: "-20px",
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                borderRadius: c.isCircle ? "50%" : "2px",
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotation}deg)`,
                boxShadow: `0 0 6px ${c.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Centered result */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`text-center fade-in ${isCorrect ? "celebration-bounce" : ""}`}
        >
          {/* Glow burst for correct answers */}
          {isCorrect && (
            <div
              className="absolute inset-0 rounded-full celebration-burst"
              style={{
                background: `radial-gradient(circle, ${textColor}60 0%, transparent 70%)`,
              }}
            />
          )}

          <div
            className="font-retro text-7xl md:text-9xl tracking-wider relative neon-glow"
            style={{
              color: textColor,
            }}
          >
            {label}
          </div>

          {damage > 0 && (
            <div className="damage-float mt-4">
              <span
                className="font-retro text-4xl neon-glow-sm"
                style={{ color: textColor }}
              >
                -{damage} HP
              </span>
            </div>
          )}

          {label === "PERFECT" && (
            <div className="mt-3 font-retro text-2xl text-[var(--flash-perfect)] neon-glow-sm tracking-wider">
              NO DAMAGE!
            </div>
          )}

          {label === "HIT" && (
            <div className="mt-3 font-retro text-xl text-[var(--flash-hit)] neon-glow-sm tracking-wider">
              NICE GUESS!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
