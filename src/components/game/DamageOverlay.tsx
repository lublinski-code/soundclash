"use client";

import { useEffect, useState } from "react";
import { getDamageLabel } from "@/lib/game/damage";

type DamageOverlayProps = {
  damage: number;
  correct: boolean;
  onComplete: () => void;
};

export function DamageOverlay({ damage, correct, onComplete }: DamageOverlayProps) {
  const [show, setShow] = useState(false);
  const label = getDamageLabel(damage);

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

      {/* Screen shake container trigger */}
      {label === "MISS" && (
        <div className="fixed inset-0 z-30 pointer-events-none screen-shake" />
      )}

      {/* Centered result */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`text-center transition-all duration-500 ${
            show ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          <div
            className="text-6xl md:text-8xl font-black tracking-tighter"
            style={{
              color: textColor,
              textShadow: `0 0 40px ${textColor}`,
            }}
          >
            {label}
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
              No damage!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
