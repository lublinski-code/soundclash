"use client";

import { Check } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { GENRES } from "@/lib/game/constants";

export function GenrePicker() {
  const { config, setConfig } = useGameStore();
  const selectedGenres = config.genres;

  const toggleGenre = (genreId: string) => {
    const current = [...selectedGenres];
    const index = current.indexOf(genreId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(genreId);
    }
    setConfig({ genres: current });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h3 className="text-body-2" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
        Genres
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {GENRES.map((genre) => {
          const selected = selectedGenres.includes(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className="chip chip-gold cursor-pointer"
              data-selected={selected}
              style={{ gap: "6px" }}
            >
              {selected && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
              {genre.label}
            </button>
          );
        })}
      </div>
      {selectedGenres.length === 0 && (
        <p className="text-caption" style={{ color: "var(--destructive)" }}>
          Select at least one genre
        </p>
      )}
    </div>
  );
}
