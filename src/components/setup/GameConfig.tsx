"use client";

import { useGameStore } from "@/store/gameStore";

export function GameConfigPanel() {
  const { config, setConfig } = useGameStore();

  const handleHpChange = (value: number) => {
    setConfig({ startingHp: Math.max(50, Math.min(300, value)) });
  };

  // Calculate percentage for gradient track
  const hpPercent = ((config.startingHp - 50) / (300 - 50)) * 100;

  return (
    <div className="space-y-6">
      {/* Starting HP */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-[var(--text-secondary)]">Starting HP</label>
          <span className="font-retro text-2xl text-[var(--accent)] tabular-nums neon-glow-sm">
            {config.startingHp} HP
          </span>
        </div>
        <div className="relative">
          {/* Custom track background */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${hpPercent}%`,
                background: `linear-gradient(90deg, var(--accent), var(--neon-pink))`,
                boxShadow: "0 0 10px var(--accent-glow)",
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
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Quick (50)</span>
          <span>Standard (100)</span>
          <span>Marathon (300)</span>
        </div>
      </div>

      {/* Damage Preview */}
      <div className="space-y-3">
        <label className="text-sm text-[var(--text-secondary)]">Damage Preview</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {config.snippetDurations.map((duration, i) => (
            <div
              key={duration}
              className="flex justify-between px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] transition-all hover:border-[var(--border-default)]"
            >
              <span className="text-[var(--text-muted)]">
                {i === 0 ? "PERFECT" : `${duration}s`}
              </span>
              <span
                className={`font-bold ${
                  config.damageTable[i] === 0
                    ? "text-[var(--flash-perfect)] neon-glow-sm"
                    : "text-[var(--flash-miss)]"
                }`}
              >
                {config.damageTable[i] === 0 ? "0" : `-${config.damageTable[i]}`}
              </span>
            </div>
          ))}
          <div
            className="flex justify-between px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border transition-all"
            style={{
              borderColor: "rgba(239, 68, 68, 0.3)",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.1)",
            }}
          >
            <span className="text-[var(--text-muted)]">MISS</span>
            <span className="font-bold text-[var(--flash-miss)] neon-glow-sm">
              -{config.damageTable[config.damageTable.length - 1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
