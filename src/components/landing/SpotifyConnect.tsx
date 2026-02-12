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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
          {userAvatar && (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm">
            <div className="text-[var(--text-primary)] font-medium">{userName}</div>
            <div className="text-[var(--text-muted)] text-xs">
              {isPlayerReady ? "Player ready" : "Connecting..."}
            </div>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleConnect}
        className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-lg transition-all hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        Connect with Spotify
      </button>
      {error && (
        <p className="text-sm text-[var(--flash-miss)]">{error}</p>
      )}
      {/* Pre-auth disclosure (Spotify Developer Terms Section V, Appendix A 5a) */}
      <div className="max-w-sm text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          Spotify Premium required. SoundClash will access your profile name and
          playback controls to run the game. No other data is collected.
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          By connecting, you agree to our{" "}
          <a href="/terms" className="text-[var(--accent)] hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[var(--accent)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
