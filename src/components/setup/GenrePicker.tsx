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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selected
                  ? "bg-transparent text-[var(--accent)] border-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-dim)]"
                  : "bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-[0_0_10px_var(--accent-dim)]"
              }`}
            >
              {genre.label}
            </button>
          );
        })}
      </div>
      {selectedGenres.length === 0 && (
        <p className="text-xs text-[var(--flash-miss)]">
          Select at least one genre
        </p>
      )}
    </div>
  );
}
