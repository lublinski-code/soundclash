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

export function HpBar({ hp, maxHp, label, subLabel, side, isActive }: HpBarProps) {
  const [displayHp, setDisplayHp] = useState(hp);
  const percent = Math.max(0, (displayHp / maxHp) * 100);
  const color = getHpColor(percent);

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

  return (
    <div
      className={`flex-1 space-y-1 ${side === "right" ? "text-right" : ""}`}
    >
      <div className={`flex items-baseline gap-2 ${side === "right" ? "justify-end" : ""}`}>
        <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
          {label}
        </span>
        {subLabel && isActive && (
          <span className="text-xs text-[var(--accent)] font-medium">
            &#x25B6; {subLabel}
          </span>
        )}
        {subLabel && !isActive && (
          <span className="text-xs text-[var(--text-muted)]">
            {subLabel}
          </span>
        )}
      </div>

      <div className="relative h-6 rounded-sm overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div
          className="absolute inset-y-0 h-full transition-all duration-500 ease-out rounded-sm"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            [side === "right" ? "right" : "left"]: 0,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white mix-blend-difference tabular-nums">
            {Math.round(displayHp)} / {maxHp}
          </span>
        </div>
      </div>
    </div>
  );
}
