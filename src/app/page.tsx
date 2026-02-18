"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpotifyConnect } from "@/components/landing/SpotifyConnect";
import { useSpotifyStore } from "@/store/spotifyStore";
import { getAccessToken, isAuthenticated } from "@/lib/spotify/auth";
import { getCurrentUser } from "@/lib/spotify/api";
import { initPlayer, isPlayerConnected, getDeviceId } from "@/lib/spotify/player";

// Generate star particles for background
function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 1 + Math.random() * 2,
  }));
}

export default function LandingPage() {
  const router = useRouter();
  const { userName, isPlayerReady, setAccessToken, setDeviceId, setPlayerReady, setUserInfo, setError } =
    useSpotifyStore();
  const [loading, setLoading] = useState(true);

  const stars = useMemo(() => generateStars(50), []);

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
    <main className="flex-1 flex flex-col relative overflow-hidden">
      {/* Star particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star-particle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[var(--cta)] opacity-[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[150px] pointer-events-none" />

      {/* Main content - centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-12 md:gap-16">
          <HeroSection />

          {loading ? (
            <div className="flex items-center gap-3 text-[var(--text-muted)]">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Checking connection...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              <SpotifyConnect />

              {userName && isPlayerReady && (
                <button
                  onClick={handleStartGame}
                  className="btn-arcade fade-in mt-4"
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
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            Powered by Spotify. Premium account required.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
            <a href="/privacy" className="hover:text-[var(--accent)] transition-colors">
              Privacy
            </a>
            <span className="text-[var(--accent)] opacity-50">•</span>
            <a href="/terms" className="hover:text-[var(--accent)] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
