"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

export function KoScreen() {
  const router = useRouter();
  const { winner, teams, roundResults, songPool, dispatch } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);

  const loser = teams.find((t) => t.id !== winner?.id);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRematch = () => {
    dispatch({ type: "RESET" });
    router.push("/setup");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-auto"
      style={{ background: "var(--bg-primary)", padding: "40px 24px" }}
    >
      {/* Starry background */}
      <div className="starry-bg" aria-hidden="true" />

      {/* KO Text */}
      <div className="text-center relative z-10" style={{ marginBottom: "24px" }}>
        <div className="ko-slam">
          <h1
            className="font-display text-gold-3d"
            style={{
              fontSize: "clamp(80px, 16vw, 160px)",
              lineHeight: "1",
            }}
          >
            K.O.
          </h1>
        </div>

        <div className={`transition-all duration-700 delay-700 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="text-subtitle-2" style={{ marginTop: "12px", color: "var(--text-muted)" }}>
            {loser?.name ?? "Team"} has been defeated!
          </p>
        </div>
      </div>

      {/* Winner + Battle Summary */}
      {showDetails && winner && (
        <div
          className="text-center fade-in mx-auto relative z-10"
          style={{
            maxWidth: "640px",
            padding: "0 16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Winner name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(32px, 6vw, 56px)",
                lineHeight: 1.1,
                color: "var(--gold)",
              }}
            >
              {winner.name} wins!
            </h2>
            <p className="text-body-2" style={{ color: "var(--text-muted)" }}>
              {winner.hp} HP remaining
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p className="text-subtitle-3" style={{ color: "var(--text-secondary)" }}>
              Battle summary
            </p>

            <div className="flex justify-center" style={{ gap: "16px" }}>
              <div
                className="card-glow flex-1"
                style={{ padding: "16px", textAlign: "center", maxWidth: "200px" }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: "32px", lineHeight: 1.2, color: "var(--text-primary)" }}
                >
                  {roundResults.length}
                </div>
                <div className="text-caption" style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  Total rounds
                </div>
              </div>
              <div
                className="card-glow flex-1"
                style={{ padding: "16px", textAlign: "center", maxWidth: "200px" }}
              >
                <div
                  className="font-display"
                  style={{ fontSize: "32px", lineHeight: 1.2, color: "var(--gold)" }}
                >
                  {roundResults.filter((r) => r.correct && r.snippetLevel === 0).length}
                </div>
                <div className="text-caption" style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                  Perfect
                </div>
              </div>
            </div>

            {/* Per-round list */}
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {roundResults.map((result, i) => {
                const guessingTeam = teams.find((t) => t.id === result.teamId);
                const targetTeam = teams.find((t) => t.id === result.targetTeamId);
                const hitOpponent = result.targetTeamId !== result.teamId;
                const track = songPool.find((t) => t.id === result.trackId);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg transition-colors"
                    style={{
                      padding: "12px 16px",
                      background: "var(--bg-secondary)",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center min-w-0" style={{ gap: "10px" }}>
                      {result.albumArt && (
                        <img
                          src={result.albumArt}
                          alt={`${result.trackName} cover`}
                          className="rounded object-cover shrink-0"
                          style={{ width: "32px", height: "32px" }}
                        />
                      )}
                      <span
                        className="text-body-2 truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {result.artistName} - {result.trackName}
                      </span>
                    </div>
                    <div className="flex items-center shrink-0" style={{ gap: "12px", marginLeft: "10px" }}>
                      {track?.songUrl && (
                        <a
                          href={track.songUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-opacity hover:opacity-80"
                          style={{ color: "var(--accent)", lineHeight: 0 }}
                          aria-label={`Listen to ${result.trackName}`}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                            <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        </a>
                      )}
                      <span className="text-caption" style={{ color: "var(--text-muted)" }}>
                        {guessingTeam?.name}
                      </span>
                      <span
                        className="text-body-2"
                        style={{
                          fontWeight: 500,
                          color: hitOpponent
                            ? "var(--success)"
                            : "var(--destructive)",
                        }}
                      >
                        {hitOpponent
                          ? `→ ${targetTeam?.name} -${result.damage} HP`
                          : `-${result.damage} HP`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Single Rematch CTA */}
          <div className="flex justify-center" style={{ paddingTop: "16px" }}>
            <button
              onClick={handleRematch}
              className="btn-arcade cursor-pointer"
              style={{ minWidth: "200px" }}
            >
              REMATCH
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
