"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { createPlaylist } from "@/lib/spotify/api";

// Generate celebration particles
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));
}

export function KoScreen() {
  const router = useRouter();
  const { winner, teams, roundResults, songPool, dispatch } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);
  const [playlistState, setPlaylistState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

  const loser = teams.find((t) => t.id !== winner?.id);
  const stars = useMemo(() => generateStars(30), []);

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)] overflow-auto px-6 py-10">
      {/* Celebration stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-[var(--neon-yellow)] opacity-0"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            boxShadow: "0 0 6px var(--neon-yellow)",
          }}
        />
      ))}

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
        }}
      />

      {/* KO Text */}
      <div className="text-center mb-8 relative z-10">
        <div className="ko-slam">
          <h1
            className="font-retro text-[8rem] md:text-[12rem] tracking-wider neon-glow"
            style={{
              color: "var(--flash-miss)",
            }}
          >
            K.O.
          </h1>
        </div>

        <div className={`transition-all duration-700 delay-700 ${showDetails ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="font-retro text-2xl text-[var(--text-muted)] mt-2 tracking-wider">
            {loser?.name ?? "Team"} has been defeated!
          </p>
        </div>
      </div>

      {/* Winner */}
      {showDetails && winner && (
        <div className="text-center space-y-6 fade-in max-w-2xl mx-auto px-4 relative z-10">
          {/* Winner Banner */}
          <div
            className="inline-block px-8 py-3 rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--flash-perfect), var(--neon-yellow))",
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
            }}
          >
            <p className="font-retro text-xl text-black uppercase tracking-[0.3em]">
              WINNER
            </p>
          </div>

          <div className="space-y-2">
            <h2
              className="font-retro text-5xl md:text-7xl text-[var(--text-primary)] tracking-wider neon-glow-sm"
              style={{ color: "var(--flash-perfect)" }}
            >
              {winner.name}
            </h2>
            <p className="font-retro text-xl text-[var(--hp-full)]">
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
                    className="w-16 h-16 rounded object-cover transition-all hover:scale-110 hover:shadow-[0_0_15px_var(--accent-glow)]"
                    style={{
                      opacity: 0,
                      animation: `fadeIn 0.3s ease-out ${i * 100}ms forwards`,
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
              <div className="card-glow p-4">
                <div className="font-retro text-4xl text-[var(--text-primary)]">
                  {roundResults.length}
                </div>
                <div className="text-xs text-[var(--text-muted)]">Total Rounds</div>
              </div>
              <div className="card-glow p-4">
                <div className="font-retro text-4xl text-[var(--flash-perfect)] neon-glow-sm">
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
                    className="flex items-center justify-between px-3 py-2 rounded text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
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
                          textShadow: result.damage === 0 ? "0 0 8px var(--flash-perfect)" : "none",
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

          {/* Save as Playlist */}
          <div className="pt-2">
            {playlistState === "idle" && (
              <button
                onClick={async () => {
                  setPlaylistState("saving");
                  try {
                    const trackUris = roundResults
                      .map((r) => {
                        const track = songPool.find((t) => t.id === r.trackId);
                        return track?.uri;
                      })
                      .filter((uri): uri is string => !!uri);
                    const uniqueUris = [...new Set(trackUris)];
                    if (uniqueUris.length === 0) {
                      setPlaylistState("error");
                      return;
                    }
                    const date = new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    const pl = await createPlaylist(
                      `SoundClash Battle - ${date}`,
                      uniqueUris,
                      `Songs from a SoundClash battle on ${date}. ${roundResults.length} rounds played.`
                    );
                    setPlaylistUrl(pl.external_urls?.spotify ?? null);
                    setPlaylistState("saved");
                  } catch (err) {
                    console.error("Playlist creation failed:", err);
                    setPlaylistState("error");
                  }
                }}
                className="btn-secondary cursor-pointer"
              >
                Save as Spotify Playlist
              </button>
            )}
            {playlistState === "saving" && (
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                Creating playlist...
              </div>
            )}
            {playlistState === "saved" && (
              <div className="text-sm text-[var(--hp-full)] neon-glow-sm">
                Playlist saved!{" "}
                {playlistUrl && (
                  <a
                    href={playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            )}
            {playlistState === "error" && (
              <div className="text-sm text-[var(--flash-miss)]">
                Failed to create playlist. Try reconnecting to Spotify.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-6">
            <button
              onClick={handlePlayAgain}
              className="btn-arcade cursor-pointer"
            >
              REMATCH
            </button>
            <button
              onClick={handleBackToHome}
              className="btn-secondary cursor-pointer"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
