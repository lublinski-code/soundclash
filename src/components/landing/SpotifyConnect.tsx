"use client";

import { useSpotifyStore } from "@/store/spotifyStore";
import { redirectToSpotifyAuth, clearTokens } from "@/lib/spotify/auth";

export function SpotifyConnect() {
  const { userName, userAvatar, isPlayerReady, error } = useSpotifyStore();

  const handleConnect = async () => {
    try {
      await redirectToSpotifyAuth();
    } catch (err) {
      console.error("Auth redirect failed:", err);
    }
  };

  const handleDisconnect = () => {
    clearTokens();
    useSpotifyStore.getState().reset();
    window.location.reload();
  };

  if (userName) {
    return (
      <div className="flex flex-col items-center" style={{ gap: "16px" }}>
        <div
          className="flex items-center rounded-lg"
          style={{
            gap: "12px",
            padding: "16px 24px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            minWidth: "280px",
            maxWidth: "90vw",
          }}
        >
          {userAvatar && (
            <img
              src={userAvatar}
              alt={`${userName}'s avatar`}
              className="rounded-full shrink-0"
              style={{
                width: "32px",
                height: "32px",
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-caption" style={{ color: "var(--text-muted)" }}>Connected as:</span>{" "}
            <span className="text-body-2 truncate" style={{ color: "var(--text-primary)" }}>{userName}</span>
          </div>
          {isPlayerReady && (
            <button
              onClick={handleDisconnect}
              className="btn-muted cursor-pointer"
              style={{ fontSize: "12px" }}
            >
              Disconnect
            </button>
          )}
        </div>
        {!isPlayerReady && (
          <div
            className="flex items-center justify-center"
            style={{ gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}
          >
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            Initializing player...
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: "24px" }}
    >
      <button
        onClick={handleConnect}
        className="btn-arcade cursor-pointer"
        style={{ minWidth: "280px" }}
      >
        CONNECT SPOTIFY
      </button>

      {error && (
        <p
          className="text-body-2"
          style={{ color: "var(--destructive)", maxWidth: "360px", textAlign: "center" }}
        >
          {error}
        </p>
      )}

      <div
        className="text-center"
        style={{
          maxWidth: "340px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <p
          className="text-caption"
          style={{ color: "var(--text-muted)" }}
        >
          Spotify Premium required. SoundClash accesses your profile
          and playback controls to run the game. No other data is collected.
        </p>
        <p
          className="text-caption"
          style={{ color: "var(--text-muted)" }}
        >
          By connecting, you agree to our{" "}
          <a
            href="/terms"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
