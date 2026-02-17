"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchTracks } from "@/lib/spotify/api";
import { useGameStore } from "@/store/gameStore";
import type { SpotifyTrack } from "@/lib/game/types";

type GuessInputProps = {
  onGuess: (trackId: string, trackName: string, artistNames: string[]) => void;
  onSkip: () => void;
  onGiveUp: () => void;
  onReplay: () => void;
  disabled: boolean;
};

export function GuessInput({ onGuess, onSkip, onGiveUp, onReplay, disabled }: GuessInputProps) {
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
    onGuess(track.id, track.name, track.artists.map((a) => a.name));
  };

  // Reset on snippet level change
  useEffect(() => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }, [currentSnippetLevel]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          placeholder="Start typing a song name..."
          className="input w-full text-base"
          autoComplete="off"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-2xl overflow-hidden">
            {results.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors text-left"
              >
                {track.album.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt=""
                    className="w-12 h-12 rounded-[var(--radius-sm)] object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-base text-[var(--text-primary)] truncate font-medium">
                    {track.name}
                  </div>
                  <div className="text-sm text-[var(--text-muted)] truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {/* Replay */}
        <button
          onClick={onReplay}
          disabled={disabled}
          className="btn-secondary"
          title="Replay snippet"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          Replay
        </button>

        {/* Skip (hear more) */}
        {canSkip && (
          <button
            onClick={onSkip}
            disabled={disabled}
            className="btn-secondary"
          >
            Skip (hear more)
          </button>
        )}

        {/* Give Up -- always visible */}
        <button
          onClick={onGiveUp}
          disabled={disabled}
          className="btn-danger"
        >
          Give up
        </button>
      </div>
    </div>
  );
}
