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
  const {
    userName,
    isPlayerReady,
    setAccessToken,
    setDeviceId,
    setPlayerReady,
    setUserInfo,
    setError,
  } = useSpotifyStore();
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

            setUserInfo(
              user.display_name,
              user.images?.[0]?.url ?? null,
              isPremium
            );

            if (!isPremium) {
              setError(
                `Your Spotify account type is "${user.product}". The Web Playback SDK requires Spotify Premium.`
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
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="starry-bg" aria-hidden="true" />

      <div
        className="relative z-10 w-full mx-auto flex flex-col items-center"
        style={{
          maxWidth: "640px",
          padding: "56px 24px 48px",
          gap: "40px",
        }}
      >
        <HeroSection />

        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ gap: "10px", color: "var(--text-muted)", fontSize: "14px" }}
          >
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span>Checking connection...</span>
          </div>
        ) : (
          <>
            <SpotifyConnect />

            {userName && isPlayerReady && (
              <button
                onClick={handleStartGame}
                className="btn-arcade fade-in cursor-pointer"
                style={{ minWidth: "280px" }}
              >
                START GAME
              </button>
            )}

            {userName && !isPlayerReady && (
              <div
                className="flex items-center justify-center"
                style={{ gap: "10px", color: "var(--text-muted)", fontSize: "14px" }}
              >
                <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span>Initializing player...</span>
              </div>
            )}
          </>
        )}
      </div>

      <footer
        className="relative z-10 text-center"
        style={{ padding: "16px 24px 32px" }}
      >
        <div className="flex flex-col items-center" style={{ gap: "8px" }}>
          <p
            className="text-caption"
            style={{ color: "var(--text-muted)" }}
          >
            Powered by Spotify &middot; Premium Required
          </p>
          <div
            className="flex items-center justify-center"
            style={{ gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}
          >
            <a
              href="/privacy"
              className="hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Privacy
            </a>
            <span style={{ opacity: 0.3 }}>&middot;</span>
            <a
              href="/terms"
              className="hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
