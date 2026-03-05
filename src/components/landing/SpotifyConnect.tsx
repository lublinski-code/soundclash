"use client";

import { useSpotifyStore } from "@/store/spotifyStore";
import { redirectToSpotifyAuth, clearTokens } from "@/lib/spotify/auth";

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

type SpotifyConnectProps = {
  onPlayAsGuest?: () => void;
};

export function SpotifyConnect({ onPlayAsGuest }: SpotifyConnectProps) {
  const { userName, userAvatar, error } = useSpotifyStore();

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
              style={{ width: "32px", height: "32px" }}
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-caption" style={{ color: "var(--text-muted)" }}>Connected as:</span>{" "}
            <span className="text-body-2 truncate" style={{ color: "var(--text-primary)" }}>{userName}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="btn-muted cursor-pointer"
            style={{ fontSize: "12px" }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  if (error === "403") {
    return (
      <div
        className="flex flex-col items-center text-center fade-in"
        style={{ gap: "16px", maxWidth: "360px" }}
      >
        <div
          className="rounded-lg"
          style={{
            padding: "16px 20px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <p className="text-body-2" style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
            App is in private beta
          </p>
          <p className="text-caption" style={{ color: "var(--text-muted)" }}>
            Your Spotify account hasn&apos;t been added yet. Ask the host to add your email, or play as a guest below.
          </p>
        </div>

        {onPlayAsGuest && (
          <button
            onClick={onPlayAsGuest}
            className="btn-arcade cursor-pointer"
            style={{ minWidth: "280px" }}
          >
            PLAY AS GUEST
          </button>
        )}

        <button
          onClick={handleConnect}
          className="btn-muted cursor-pointer text-caption"
        >
          Try a different account
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" style={{ gap: "16px" }}>
      <button
        onClick={handleConnect}
        className="btn-arcade cursor-pointer"
        style={{ minWidth: "280px" }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <SpotifyIcon />
          LOGIN WITH SPOTIFY
        </span>
      </button>

      {error && error !== "403" && (
        <p
          className="text-body-2"
          style={{ color: "var(--destructive)", maxWidth: "360px", textAlign: "center" }}
        >
          {error}
        </p>
      )}

      <div
        className="text-center"
        style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "340px" }}
      >
        <p className="text-caption" style={{ color: "var(--text-muted)" }}>
          Any Spotify account works. SoundClash uses your profile to personalize the experience.
        </p>
        <p className="text-caption" style={{ color: "var(--text-muted)" }}>
          By connecting, you agree to our{" "}
          <a href="/terms" className="hover:underline" style={{ color: "var(--accent)" }}>Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="hover:underline" style={{ color: "var(--accent)" }}>Privacy Policy</a>.
        </p>
      </div>

      {onPlayAsGuest && (
        <button
          onClick={onPlayAsGuest}
          className="btn-muted cursor-pointer text-caption"
        >
          Play as guest
        </button>
      )}
    </div>
  );
}
