"use client";

import { useEffect, useState, useMemo } from "react";
import { getDamageLabel } from "@/lib/game/damage";

type DamageOverlayProps = {
  damage: number;
  correct: boolean;
  onComplete: () => void;
};

// Generate random confetti particles
function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: ["#ffd700", "#00ff88", "#ff6b6b", "#4fc3f7", "#ba68c8", "#fff"][
      Math.floor(Math.random() * 6)
    ],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

export function DamageOverlay({ damage, correct, onComplete }: DamageOverlayProps) {
  const [show, setShow] = useState(false);
  const label = getDamageLabel(damage);
  const isCorrect = label === "PERFECT" || label === "HIT";

  // Generate confetti only for correct guesses
  const confetti = useMemo(
    () => (isCorrect ? generateConfetti(label === "PERFECT" ? 40 : 25) : []),
    [isCorrect, label]
  );

  useEffect(() => {
    setShow(true);
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
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Centered result */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`text-center transition-all duration-500 ${
            show ? "opacity-100 scale-100" : "opacity-0 scale-50"
          } ${isCorrect ? "celebration-bounce" : ""}`}
        >
          {/* Glow burst for correct answers */}
          {isCorrect && (
            <div
              className="absolute inset-0 rounded-full celebration-burst"
              style={{
                background: `radial-gradient(circle, ${textColor}40 0%, transparent 70%)`,
              }}
            />
          )}

          <div
            className="text-6xl md:text-8xl font-black tracking-tighter relative"
            style={{
              color: textColor,
              textShadow: `0 0 40px ${textColor}`,
            }}
          >
            {label === "PERFECT" && "🎉 "}
            {label}
            {label === "PERFECT" && " 🎉"}
          </div>

          {damage > 0 && (
            <div className="damage-float mt-4">
              <span
                className="text-3xl font-black"
                style={{ color: textColor }}
              >
                -{damage} HP
              </span>
            </div>
          )}

          {label === "PERFECT" && (
            <div className="mt-2 text-lg text-[var(--flash-perfect)] font-bold">
              ✨ No damage! ✨
            </div>
          )}

          {label === "HIT" && (
            <div className="mt-2 text-lg text-[var(--flash-hit)] font-bold">
              Nice guess!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
