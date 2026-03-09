"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import type { SpotifyTrack } from "@/lib/game/types";

type GuessInputProps = {
  onGuess: (trackId: string, trackName: string, artistNames: string[]) => void;
  onGiveUp: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  disabled: boolean;
};

export function GuessInput({ onGuess, onGiveUp, onSkip, canSkip, disabled }: GuessInputProps) {
  const { config, currentSnippetLevel } = useGameStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentHitDamage = config.correctDamageTable[Math.min(currentSnippetLevel, config.correctDamageTable.length - 1)] ?? 3;
  const giveUpDamage = config.wrongSelfDamage;

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setSearching(true);
      try {
        const params = new URLSearchParams({ q, limit: "6" });
        if (config.market) params.set("market", config.market);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search request failed");
        const data = await res.json();
        const tracks: SpotifyTrack[] = data.tracks ?? [];
        setResults(tracks);
        setShowResults(tracks.length > 0);
      } catch {
        setResults([]);
        setShowResults(false);
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

  useEffect(() => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }, [currentSnippetLevel]);

  return (
    <div className="w-full flex flex-col items-center" style={{ gap: "16px" }}>
      {/* Input + Hear More: horizontal on desktop, stacked on mobile */}
      <div className="relative w-full" style={{ maxWidth: "600px" }}>
        <div className="flex flex-col sm:flex-row items-stretch" style={{ gap: "12px" }}>
          {/* Search input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled}
              placeholder="Start writing the artist name..."
              className="input-surface w-full"
              style={{ paddingRight: "72px" }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && results.length > 0) {
                  handleSelect(results[0]);
                }
              }}
            />
            {/* Hit power indicator */}
            <span
              className="font-display absolute top-1/2 -translate-y-1/2"
              style={{
                right: "20px",
                fontSize: "16px",
                lineHeight: 1.3,
                color: "var(--accent)",
                pointerEvents: "none",
              }}
            >
              {currentHitDamage} HP
            </span>
            {searching && (
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ right: "80px" }}
              >
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Hear More button */}
          {canSkip && onSkip && (
            <button
              onClick={onSkip}
              className="guess-hear-more shrink-0 flex items-center justify-center cursor-pointer transition-colors"
              style={{
                gap: "8px",
                background: "var(--bg-secondary)",
                border: "none",
                borderRadius: "12px",
                padding: "0 20px",
                color: "var(--text-muted)",
                fontSize: "14px",
                fontWeight: 500,
                minHeight: "56px",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
              aria-label="Hear a longer snippet"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
              </svg>
              Hear More
            </button>
          )}
        </div>

        {/* Search results dropdown — upward on mobile, downward on desktop */}
        {showResults && results.length > 0 && (
          <div
            className="guess-dropdown absolute z-50 w-full rounded-[var(--radius-lg)] glass"
            style={{
              maxHeight: "280px",
              overflowY: "auto",
            }}
          >
            {results.map((track) => (
              <button
                key={track.id}
                onPointerDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center transition-colors text-left cursor-pointer"
                style={{
                  gap: "14px",
                  padding: "14px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {track.album.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt={`${track.album.name} cover`}
                    className="rounded object-cover flex-shrink-0"
                    style={{ width: "40px", height: "40px" }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body-2" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {track.name}
                  </div>
                  <div className="truncate text-caption" style={{ color: "var(--text-muted)", marginTop: "2px" }}>
                    {track.artists.map((a) => a.name).join(", ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Give up button */}
      <button
        onClick={onGiveUp}
        disabled={disabled}
        className="group flex items-center gap-2 cursor-pointer rounded-md px-4 py-2 border-none bg-transparent transition-colors duration-150 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
        aria-label={`Give up — lose ${giveUpDamage} HP`}
      >
        <span
          className="text-body-2 font-medium text-[var(--text-muted)] transition-colors duration-150 group-hover:text-[var(--text-secondary)]"
        >
          I Give up
        </span>
        <span
          className="font-display text-[var(--destructive)] transition-colors duration-150 group-hover:text-[var(--destructive-hover)]"
          style={{ fontSize: "16px", lineHeight: 1.3 }}
        >
          -{giveUpDamage} HP
        </span>
      </button>
    </div>
  );
}
