"use client";

import { Check } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { ERAS } from "@/lib/game/constants";

export function EraPicker() {
  const { config, setConfig } = useGameStore();
  const selectedEras = config.eras;

  const toggleEra = (eraId: string) => {
    const current = [...selectedEras];
    const index = current.indexOf(eraId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(eraId);
    }
    setConfig({ eras: current });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h3 className="text-body-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        Era
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {ERAS.map((era) => {
          const selected = selectedEras.includes(era.id);
          return (
            <button
              key={era.id}
              onClick={() => toggleEra(era.id)}
              className="chip chip-pink cursor-pointer"
              data-selected={selected}
              style={{ gap: "6px" }}
            >
              {selected && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
              {era.label}
            </button>
          );
        })}
      </div>
      <p className="text-caption" style={{ color: "var(--text-muted)" }}>
        {selectedEras.length === 0
          ? "All decades (no filter)"
          : `Filtering to ${selectedEras.length} decade${selectedEras.length > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
