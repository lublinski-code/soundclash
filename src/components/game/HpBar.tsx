"use client";

import { useEffect, useState } from "react";

type HpBarProps = {
  hp: number;
  maxHp: number;
  label: string;
  subLabel?: string;
  side: "left" | "right";
  isActive: boolean;
};

function getHpColor(percent: number): string {
  if (percent > 60) return "var(--hp-full)";
  if (percent > 30) return "var(--hp-mid)";
  if (percent > 15) return "var(--hp-low)";
  return "var(--hp-critical)";
}

function getHpGradient(percent: number): string {
  if (percent > 60) return "linear-gradient(90deg, #16a34a, #22c55e, #4ade80)";
  if (percent > 30) return "linear-gradient(90deg, #ca8a04, #eab308, #facc15)";
  if (percent > 15) return "linear-gradient(90deg, #dc2626, #ef4444, #f87171)";
  return "linear-gradient(90deg, #991b1b, #dc2626, #ef4444)";
}

export function HpBar({ hp, maxHp, label, subLabel, side, isActive }: HpBarProps) {
  const [displayHp, setDisplayHp] = useState(hp);
  const percent = Math.max(0, (displayHp / maxHp) * 100);
  const color = getHpColor(percent);
  const gradient = getHpGradient(percent);
  const isCritical = percent <= 15;

  useEffect(() => {
    if (displayHp === hp) return;

    const diff = displayHp - hp;
    const steps = 20;
    const stepSize = diff / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplayHp(hp);
        clearInterval(interval);
      } else {
        setDisplayHp((prev) => prev - stepSize);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [hp, displayHp]);

  const sideColor = side === "left" ? "var(--hp-full)" : "var(--hp-low)";

  return (
    <div
      className={`flex-1 space-y-1.5 ${side === "right" ? "text-right" : ""}`}
    >
      <div className={`flex items-baseline gap-2 ${side === "right" ? "justify-end" : ""}`}>
        <span
          className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider"
          style={{
            textShadow: isActive ? `0 0 10px ${sideColor}` : "none",
          }}
        >
          {label}
        </span>
        {subLabel && isActive && (
          <span className="text-xs text-[var(--accent)] font-medium neon-glow-sm">
            ▶ {subLabel}
          </span>
        )}
        {subLabel && !isActive && (
          <span className="text-xs text-[var(--text-muted)]">
            {subLabel}
          </span>
        )}
      </div>

      {/* HP Bar Container - metallic chrome style */}
      <div
        className="relative h-7 rounded-md overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a1a2e 0%, #12121a 50%, #1a1a2e 100%)",
          border: "1px solid var(--border-default)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* HP Fill */}
        <div
          className={`absolute inset-y-0 h-full transition-all duration-500 ease-out rounded-sm ${isCritical ? "hp-critical-pulse" : ""}`}
          style={{
            width: `${percent}%`,
            background: gradient,
            [side === "right" ? "right" : "left"]: 0,
            boxShadow: `0 0 15px ${color}, inset 0 1px 0 rgba(255,255,255,0.3)`,
          }}
        >
          {/* Shine effect on HP bar */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
            }}
          />
        </div>

        {/* HP Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-retro text-base text-white tabular-nums"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)",
            }}
          >
            {Math.round(displayHp)} / {maxHp}
          </span>
        </div>
      </div>
    </div>
  );
}
