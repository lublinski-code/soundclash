"use client";

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
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        Genres
      </h3>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const selected = selectedGenres.includes(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selected
                  ? "bg-[var(--accent)] text-white border border-[var(--accent)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
              }`}
            >
              {genre.label}
            </button>
          );
        })}
      </div>
      {selectedGenres.length === 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          Select at least one genre
        </p>
      )}
    </div>
  );
}
