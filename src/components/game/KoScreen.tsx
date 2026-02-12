"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { extractDominantColor } from "@/lib/utils/colorExtract";

export function KoScreen() {
  const router = useRouter();
  const { winner, teams, roundResults, config, dispatch } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);

  const loser = teams.find((t) => t.id !== winner?.id);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayAgain = () => {
    dispatch({ type: "RESET" });
    router.push("/setup");
  };

  const handleBackToHome = () => {
    dispatch({ type: "RESET" });
    router.push("/");
  };

  // Get album art collage from round results
  const albumArts = roundResults
    .filter((r) => r.albumArt)
    .map((r) => r.albumArt)
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-auto py-8">
      {/* KO Text */}
      <div className="text-center mb-8">
        <div className="ko-slam">
          <h1
            className="text-8xl md:text-[10rem] font-black tracking-tighter"
            style={{
              color: "var(--flash-miss)",
              textShadow: "0 0 60px var(--flash-miss), 0 0 120px var(--flash-miss)",
            }}
          >
            K.O.
          </h1>
        </div>

        <div className={`transition-all duration-700 delay-700 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-xl text-[var(--text-muted)] mt-2">
            {loser?.name ?? "Team"} has been defeated!
          </p>
        </div>
      </div>

      {/* Winner */}
      {showDetails && winner && (
        <div className="text-center space-y-6 fade-in max-w-2xl mx-auto px-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-[var(--flash-perfect)]">
              Winner
            </p>
            <h2 className="text-4xl md:text-6xl font-black text-[var(--text-primary)]">
              {winner.name}
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              {winner.hp} HP remaining
            </p>
          </div>

          {/* Album Art Collage */}
          {albumArts.length > 0 && (
            <div className="pt-4">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Songs from this battle
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {albumArts.map((art, i) => (
                  <img
                    key={i}
                    src={art}
                    alt=""
                    className="w-16 h-16 rounded object-cover opacity-80 hover:opacity-100 transition-opacity"
                    style={{
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Round Summary */}
          <div className="pt-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Battle Summary
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <div className="text-2xl font-black text-[var(--text-primary)]">
                  {roundResults.length}
                </div>
                <div className="text-xs text-[var(--text-muted)]">Total Rounds</div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                <div className="text-2xl font-black text-[var(--flash-perfect)]">
                  {roundResults.filter((r) => r.damage === 0).length}
                </div>
                <div className="text-xs text-[var(--text-muted)]">Perfects</div>
              </div>
            </div>

            {/* Per-round details */}
            <div className="mt-4 space-y-1 max-h-48 overflow-y-auto">
              {roundResults.map((result, i) => {
                const team = teams.find((t) => t.id === result.teamId);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {result.albumArt && (
                        <img src={result.albumArt} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                      )}
                      <span className="text-[var(--text-secondary)] truncate">
                        {result.trackName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[var(--text-muted)]">{team?.name}</span>
                      <span
                        className="font-bold"
                        style={{
                          color:
                            result.damage === 0
                              ? "var(--flash-perfect)"
                              : result.correct
                              ? "var(--flash-hit)"
                              : "var(--flash-miss)",
                        }}
                      >
                        {result.damage === 0 ? "PERFECT" : result.correct ? `-${result.damage}` : "MISS"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={handlePlayAgain}
              className="px-8 py-3 rounded-lg bg-[var(--accent)] hover:bg-[#7c3aed] text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
            >
              REMATCH
            </button>
            <button
              onClick={handleBackToHome}
              className="px-8 py-3 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-all"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
