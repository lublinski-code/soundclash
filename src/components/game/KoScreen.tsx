"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { createPlaylist } from "@/lib/spotify/api";

export function KoScreen() {
  const router = useRouter();
  const { winner, teams, roundResults, songPool, dispatch } = useGameStore();
  const [showDetails, setShowDetails] = useState(false);
  const [playlistState, setPlaylistState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

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
                  {roundResults.filter((r) => r.damage === 0).length}
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
                const team = teams.find((t) => t.id === result.teamId);
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
                      <span className="text-caption" style={{ color: "var(--text-muted)" }}>
                        {team?.name}
                      </span>
                      <span
                        className="text-body-2"
                        style={{
                          fontWeight: 500,
                          color:
                            result.damage === 0
                              ? "var(--gold)"
                              : result.correct
                              ? "var(--success)"
                              : "var(--destructive)",
                        }}
                      >
                        {result.damage === 0
                          ? "0 HP"
                          : result.correct
                          ? `-${result.damage} HP`
                          : `-${result.damage} HP`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save as Playlist */}
          <div>
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
              <div
                className="flex items-center justify-center text-body-2"
                style={{ gap: "10px", color: "var(--text-muted)" }}
              >
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                Creating playlist...
              </div>
            )}
            {playlistState === "saved" && (
              <div className="text-body-2" style={{ color: "var(--success)" }}>
                Playlist saved!{" "}
                {playlistUrl && (
                  <a
                    href={playlistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            )}
            {playlistState === "error" && (
              <div className="text-body-2" style={{ color: "var(--destructive)" }}>
                Failed to create playlist. Try reconnecting to Spotify.
              </div>
            )}
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
