"use client";

import { useGameStore } from "@/store/gameStore";
import { ERAS } from "@/lib/game/constants";

export function EraPicker() {
  const { config, setConfig } = useGameStore();
  const selectedEras = config.eras;

  const toggleEra = (yearRange: string) => {
    const current = [...selectedEras];
    const index = current.indexOf(yearRange);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(yearRange);
    }
    setConfig({ eras: current });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        Era
      </h3>
      <div className="flex flex-wrap gap-2">
        {ERAS.map((era) => {
          const selected = selectedEras.includes(era.yearRange);
          return (
            <button
              key={era.id}
              onClick={() => toggleEra(era.yearRange)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                selected
                  ? "bg-[var(--accent)] text-white border border-[var(--accent)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}
            >
              {era.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        {selectedEras.length === 0
          ? "No era filter — all decades"
          : `${selectedEras.length} era(s) selected`}
      </p>
    </div>
  );
}
