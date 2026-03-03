"use client";

import { useEffect, useMemo } from "react";
import { getDamageLabel } from "@/lib/game/damage";

type DamageOverlayProps = {
  damage: number;
  correct: boolean;
  artistOnly?: boolean;
  targetName: string;
  onComplete: () => void;
};

function generateConfetti(count: number) {
  const colors = [
    "#fff982", "#d4cc5a", "#1ed760", "#ffffff", "#d3eafe", "#ffccf3",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
}

export function DamageOverlay({ damage, correct, artistOnly = false, targetName, onComplete }: DamageOverlayProps) {
  const label = getDamageLabel(damage, correct, artistOnly);
  const isPositive = label === "PERFECT" || label === "HIT" || label === "CLOSE";

  const confetti = useMemo(
    () => (isPositive ? generateConfetti(label === "PERFECT" ? 50 : 25) : []),
    [isPositive, label]
  );

  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const flashClass =
    label === "PERFECT" ? "flash-perfect"
      : label === "HIT" ? "flash-hit"
        : label === "CLOSE" ? "flash-close"
          : "flash-miss";

  const textColor =
    label === "PERFECT" ? "var(--flash-perfect)"
      : label === "HIT" ? "var(--flash-hit)"
        : label === "CLOSE" ? "var(--warning)"
          : "var(--flash-miss)";

  const hpLine = isPositive
    ? `${targetName} takes -${damage} HP`
    : `You take -${damage} HP`;

  return (
    <>
      <div className={`fixed inset-0 z-40 pointer-events-none ${flashClass}`} />

      {label === "MISS" && (
        <div className="fixed inset-0 z-30 pointer-events-none screen-shake" />
      )}

      {isPositive && (
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

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`text-center fade-in ${isPositive ? "celebration-bounce" : ""}`}>
          {isPositive && (
            <div
              className="absolute inset-0 rounded-full celebration-burst"
              style={{
                background: `radial-gradient(circle, ${textColor}60 0%, transparent 70%)`,
              }}
            />
          )}

          <div
            className="font-display relative"
            style={{
              fontSize: "clamp(56px, 12vw, 120px)",
              lineHeight: 1.1,
              color: textColor,
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>

          {damage > 0 && (
            <div className="damage-float" style={{ marginTop: "16px" }}>
              <span
                className="font-display"
                style={{ fontSize: "clamp(24px, 5vw, 40px)", color: textColor }}
              >
                -{damage} HP
              </span>
            </div>
          )}

          <div
            className="text-body-1"
            style={{
              marginTop: "12px",
              color: textColor,
              fontWeight: 500,
            }}
          >
            {label === "PERFECT" && "KNOCKOUT BLOW!"}
            {label === "HIT" && "NICE GUESS!"}
            {label === "CLOSE" && "RIGHT ARTIST!"}
            {label === "MISS" && "WRONG!"}
          </div>

          <div
            className="text-body-2"
            style={{
              marginTop: "8px",
              color: "var(--text-muted)",
              fontWeight: 400,
            }}
          >
            {hpLine}
          </div>
        </div>
      </div>
    </>
  );
}
