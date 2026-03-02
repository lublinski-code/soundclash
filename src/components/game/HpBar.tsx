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
  if (percent > 60) return "var(--accent)";
  if (percent > 30) return "var(--gold)";
  if (percent > 15) return "var(--destructive)";
  return "#dc2626";
}

export function HpBar({ hp, maxHp, label, subLabel, side, isActive }: HpBarProps) {
  const [displayHp, setDisplayHp] = useState(hp);
  const percent = Math.max(0, (displayHp / maxHp) * 100);
  const color = getHpColor(percent);
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

  const hpValue = `${Math.round(displayHp)}HP`;
  const nameStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 2.5vw, 24px)",
    lineHeight: 1.3,
    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
  };
  const hpStyle: React.CSSProperties = {
    fontSize: "clamp(14px, 2.5vw, 24px)",
    lineHeight: 1.3,
    color: color,
  };

  return (
    <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Label row — order swapped per side */}
      {side === "left" ? (
        <div className="flex items-baseline" style={{ gap: "12px" }}>
          <span className="font-display" style={nameStyle}>{label}</span>
          <span className="font-display tabular-nums" style={hpStyle}>{hpValue}</span>
          {subLabel && (
            <span className="text-caption" style={{ color: "var(--text-muted)" }}>{subLabel}</span>
          )}
        </div>
      ) : (
        <div className="flex items-baseline justify-end" style={{ gap: "12px" }}>
          {subLabel && (
            <span className="text-caption" style={{ color: "var(--text-muted)" }}>{subLabel}</span>
          )}
          <span className="font-display tabular-nums" style={hpStyle}>{hpValue}</span>
          <span className="font-display" style={nameStyle}>{label}</span>
        </div>
      )}

      {/* HP bar — flat, no border-radius */}
      <div
        className="relative overflow-hidden"
        style={{
          height: "40px",
          background: "var(--bg-surface)",
        }}
      >
        <div
          className={`absolute inset-y-0 h-full transition-all duration-500 ease-out ${isCritical ? "hp-critical-pulse" : ""}`}
          style={{
            width: `${percent}%`,
            background: color,
            [side === "right" ? "right" : "left"]: 0,
          }}
        />
      </div>
    </div>
  );
}
