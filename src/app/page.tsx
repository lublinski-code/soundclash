"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpotifyConnect } from "@/components/landing/SpotifyConnect";
import { useSpotifyStore } from "@/store/spotifyStore";
import { getAccessToken, isAuthenticated } from "@/lib/spotify/auth";
import { getCurrentUser } from "@/lib/spotify/api";
import { initPlayer, isPlayerConnected, getDeviceId } from "@/lib/spotify/player";

export default function LandingPage() {
  const router = useRouter();
  const { userName, isPlayerReady, setAccessToken, setDeviceId, setPlayerReady, setUserInfo, setError } =
    useSpotifyStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        if (typeof window !== "undefined" && isPlayerConnected()) {
          const did = getDeviceId();
          if (did) {
            setDeviceId(did);
            setPlayerReady(true);
          }
          setLoading(false);
          return;
        }

        if (isAuthenticated()) {
          const token = await getAccessToken();
          if (token) {
            setAccessToken(token);
            const user = await getCurrentUser();
            const isPremium = user.product === "premium";
            console.log("Spotify user:", user.display_name, "| Product:", user.product);

            setUserInfo(
              user.display_name,
              user.images?.[0]?.url ?? null,
              isPremium
            );

            if (!isPremium) {
              setError(
                `Your Spotify account type is "${user.product}". The Web Playback SDK requires Spotify Premium. Please upgrade or use a Premium account.`
              );
              setLoading(false);
              return;
            }

            await initPlayer(
              (deviceId) => {
                setDeviceId(deviceId);
                setPlayerReady(true);
              },
              (error) => setError(error)
            );
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartGame = () => {
    router.push("/setup");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-12">
      <HeroSection />

      {loading ? (
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <div className="w-5 h-5 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Checking connection...</span>
        </div>
      ) : (
        <>
          <SpotifyConnect />

          {userName && isPlayerReady && (
            <button
              onClick={handleStartGame}
              className="fade-in px-12 py-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent)] text-[var(--text-primary)] font-bold text-xl transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_var(--accent-dim)]"
            >
              START GAME
            </button>
          )}

          {userName && !isPlayerReady && (
            <div className="flex items-center gap-3 text-[var(--text-muted)]">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Initializing player...</span>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="absolute bottom-6 text-center space-y-1">
        <p className="text-xs text-[var(--text-muted)]">
          Powered by Spotify. Premium account required.
        </p>
        <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
          <a href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
            Privacy
          </a>
          <span>&middot;</span>
          <a href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
            Terms
          </a>
        </div>
      </footer>
    </main>
  );
}
