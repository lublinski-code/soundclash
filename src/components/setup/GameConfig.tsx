"use client";

import { useGameStore } from "@/store/gameStore";

export function GameConfigPanel() {
  const { config, setConfig } = useGameStore();

  const handleHpChange = (value: number) => {
    setConfig({ startingHp: Math.max(50, Math.min(300, value)) });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        Battle Settings
      </h3>

      {/* Starting HP */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm text-[var(--text-secondary)]">Starting HP</label>
          <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
            {config.startingHp} HP
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={300}
          step={10}
          value={config.startingHp}
          onChange={(e) => handleHpChange(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Quick (50)</span>
          <span>Standard (100)</span>
          <span>Marathon (300)</span>
        </div>
      </div>

      {/* Damage Preview */}
      <div className="space-y-2">
        <label className="text-sm text-[var(--text-secondary)]">Damage Preview</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {config.snippetDurations.map((duration, i) => (
            <div
              key={duration}
              className="flex justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            >
              <span className="text-[var(--text-muted)]">
                {i === 0 ? "PERFECT" : `${duration}s`}
              </span>
              <span
                className={`font-bold ${
                  config.damageTable[i] === 0
                    ? "text-[var(--flash-perfect)]"
                    : "text-[var(--flash-miss)]"
                }`}
              >
                {config.damageTable[i] === 0 ? "0" : `-${config.damageTable[i]}`}
              </span>
            </div>
          ))}
          <div className="flex justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--flash-miss)] border-opacity-30">
            <span className="text-[var(--text-muted)]">MISS</span>
            <span className="font-bold text-[var(--flash-miss)]">
              -{config.damageTable[config.damageTable.length - 1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
