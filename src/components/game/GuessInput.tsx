"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchTracks } from "@/lib/spotify/api";
import { useGameStore } from "@/store/gameStore";
import type { SpotifyTrack } from "@/lib/game/types";

type GuessInputProps = {
  onGuess: (trackId: string) => void;
  onSkip: () => void;
  disabled: boolean;
};

export function GuessInput({ onGuess, onSkip, disabled }: GuessInputProps) {
  const { config, currentSnippetLevel } = useGameStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLevel = config.snippetDurations.length - 1;
  const canSkip = currentSnippetLevel < maxLevel;

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const tracks = await searchTracks(q, 6, config.market);
        setResults(tracks);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [config.market]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  const handleSelect = (track: SpotifyTrack) => {
    setShowResults(false);
    setQuery(`${track.name} — ${track.artists.map((a) => a.name).join(", ")}`);
    onGuess(track.id);
  };

  // Reset on snippet level change
  useEffect(() => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }, [currentSnippetLevel]);

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Start typing a song name..."
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-40 text-sm"
          autoComplete="off"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-2xl overflow-hidden">
            {results.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors text-left"
              >
                {track.album.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt=""
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[var(--text-primary)] truncate">
                    {track.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {canSkip && (
          <button
            onClick={onSkip}
            disabled={disabled}
            className="px-6 py-2 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-all disabled:opacity-30"
          >
            Skip (hear more)
          </button>
        )}
        {!canSkip && (
          <button
            onClick={onSkip}
            disabled={disabled}
            className="px-6 py-2 rounded-lg border border-[var(--flash-miss)] text-sm text-[var(--flash-miss)] hover:bg-[var(--flash-miss)] hover:text-white transition-all disabled:opacity-30"
          >
            Give up
          </button>
        )}
      </div>
    </div>
  );
}
