"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import type { Track } from "@/lib/game/types";

// Minimal Web Speech API types (not in standard TS lib)
type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
declare const SpeechRecognition: new () => SpeechRecognitionInstance;
declare const webkitSpeechRecognition: new () => SpeechRecognitionInstance;

type GuessInputProps = {
  onGuess: (trackId: string, trackName: string, artistNames: string[]) => void;
  onGiveUp: () => void;
  onSkip?: () => void;
  canSkip?: boolean;
  disabled: boolean;
};

export function GuessInput({ onGuess, onGiveUp, onSkip, canSkip, disabled }: GuessInputProps) {
  const { config, currentSnippetLevel, currentSongIndex } = useGameStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [listening, setListening] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechPendingAutoSelectRef = useRef(false);
  const autoSelectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentHitDamage = config.correctDamageTable[Math.min(currentSnippetLevel, config.correctDamageTable.length - 1)] ?? 3;
  const giveUpDamage = config.wrongSelfDamage;

  const speechAvailable = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }
      setSearching(true);
      try {
        // Run multiple search strategies in parallel for flexible matching:
        // 1. Raw query (best for full "Artist - Song" or partial song name)
        // 2. artist: prefix (best for searching by artist name only)
        // 3. track: prefix (best for searching by song name only)
        const base = new URLSearchParams({ limit: "8" });
        if (config.market) base.set("market", config.market);

        const [raw, byArtist, byTrack] = await Promise.all([
          fetch(`/api/search?${new URLSearchParams({ ...Object.fromEntries(base), q })}`).then(r => r.json()).catch(() => ({ tracks: [] })),
          fetch(`/api/search?${new URLSearchParams({ ...Object.fromEntries(base), q: `artist:${q}` })}`).then(r => r.json()).catch(() => ({ tracks: [] })),
          fetch(`/api/search?${new URLSearchParams({ ...Object.fromEntries(base), q: `track:${q}` })}`).then(r => r.json()).catch(() => ({ tracks: [] })),
        ]);

        const seen = new Set<string>();
        const merged: Track[] = [];
        for (const track of [
          ...(raw.tracks ?? []),
          ...(byArtist.tracks ?? []),
          ...(byTrack.tracks ?? []),
        ]) {
          if (!seen.has(track.id)) {
            seen.add(track.id);
            merged.push(track);
          }
        }

        setResults(merged.slice(0, 8));
        setShowResults(merged.length > 0);
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

  const handleSelect = (track: Track) => {
    setShowResults(false);
    setQuery(`${track.name} — ${track.artists.map((a) => a.name).join(", ")}`);
    onGuess(track.id, track.name, track.artists.map((a) => a.name));
  };

  // Auto-select first result after voice input (single match = quick, multiple = short delay to glance)
  useEffect(() => {
    if (!speechPendingAutoSelectRef.current || results.length === 0) return;
    if (autoSelectTimeoutRef.current) clearTimeout(autoSelectTimeoutRef.current);
    const trackToSelect = results[0];
    const delay = results.length === 1 ? 600 : 1200;
    autoSelectTimeoutRef.current = setTimeout(() => {
      speechPendingAutoSelectRef.current = false;
      if (trackToSelect) {
        setShowResults(false);
        setQuery(`${trackToSelect.name} — ${trackToSelect.artists.map((a) => a.name).join(", ")}`);
        onGuess(trackToSelect.id, trackToSelect.name, trackToSelect.artists.map((a) => a.name));
      }
      autoSelectTimeoutRef.current = undefined;
    }, delay);
    return () => {
      if (autoSelectTimeoutRef.current) clearTimeout(autoSelectTimeoutRef.current);
    };
  }, [results, onGuess]);

  // Reset on new song OR new snippet level
  useEffect(() => {
    speechPendingAutoSelectRef.current = false;
    if (autoSelectTimeoutRef.current) clearTimeout(autoSelectTimeoutRef.current);
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  }, [currentSnippetLevel, currentSongIndex]);

  const startListening = useCallback(() => {
    if (!speechAvailable) return;

    const Rec = (typeof SpeechRecognition !== "undefined" ? SpeechRecognition : webkitSpeechRecognition);
    const rec = new Rec();
    recognitionRef.current = rec;

    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        speechPendingAutoSelectRef.current = true;
        setQuery(transcript);
      }
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
    setListening(true);
  }, [speechAvailable]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

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
              placeholder="Song or artist name..."
              className="input-surface w-full"
              style={{
                paddingRight: speechAvailable ? "110px" : "72px",
              }}
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

            {/* Mic button — no background, left of HP with clear gap */}
            {speechAvailable && (
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                disabled={disabled}
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
                style={{
                  right: "92px",
                  width: "32px",
                  height: "32px",
                  background: "transparent",
                  border: "none",
                  color: listening ? "var(--destructive)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
                aria-label={listening ? "Stop listening" : "Speak answer"}
                title={listening ? "Stop listening" : "Say the song or artist name"}
              >
                {listening ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V20H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 11h-2z" />
                  </svg>
                )}
              </button>
            )}

            {/* HP count */}
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
                style={{ right: speechAvailable ? "134px" : "80px" }}
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

      {/* Listening indicator */}
      {listening && (
        <div className="flex items-center gap-2" style={{ color: "var(--destructive)" }}>
          <span className="w-2 h-2 rounded-full bg-[var(--destructive)] animate-pulse" />
          <span className="text-caption">Listening... say the song or artist name</span>
        </div>
      )}

      {/* Give up button */}
      <button
        onClick={onGiveUp}
        disabled={disabled}
        className="group flex items-center gap-2 cursor-pointer rounded-md border-none bg-transparent transition-colors duration-150 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2"
        style={{ padding: "20px" }}
        aria-label={`Give up — lose ${giveUpDamage} HP`}
      >
        <span className="text-body-2 font-medium text-[var(--text-muted)] transition-colors duration-150 group-hover:text-[var(--text-secondary)]">
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
