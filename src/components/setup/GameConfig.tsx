"use client";

import { useGameStore } from "@/store/gameStore";

export function GameConfigPanel() {
  const { config, setConfig } = useGameStore();

  const handleHpChange = (value: number) => {
    setConfig({ startingHp: Math.max(50, Math.min(300, value)) });
  };

  const hpPercent = ((config.startingHp - 50) / (300 - 50)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Starting HP */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className="flex justify-between items-center">
          <label className="text-body-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            Starting HP
          </label>
          <span
            className="font-display tabular-nums"
            style={{ fontSize: "24px", color: "var(--text-primary)" }}
          >
            {config.startingHp}HP
          </span>
        </div>
        <div className="relative">
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden"
            style={{
              height: "8px",
              borderRadius: "4px",
              background: "var(--bg-surface)",
            }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${hpPercent}%`,
                borderRadius: "4px",
                background: "var(--main-action)",
              }}
            />
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={config.startingHp}
            onChange={(e) => handleHpChange(Number(e.target.value))}
            className="relative z-10 w-full cursor-pointer"
            style={{ background: "transparent" }}
          />
        </div>
        {/* Labels at exact HP positions: Quick=50HP(0%), Standard=100HP(20%), Marathon=300HP(100%) */}
        <div className="relative text-caption" style={{ color: "var(--text-muted)", height: "18px", marginTop: "4px" }}>
          <span style={{ position: "absolute", left: "0%" }}>Quick</span>
          <span style={{ position: "absolute", left: "20%", transform: "translateX(-50%)" }}>Standard</span>
          <span style={{ position: "absolute", right: "0%" }}>Marathon</span>
        </div>
      </div>
    </div>
  );
}
