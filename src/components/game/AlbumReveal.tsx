"use client";

import { useEffect, useState } from "react";
import { extractDominantColor, createGlow } from "@/lib/utils/colorExtract";

type AlbumRevealProps = {
  albumArt: string;
  trackName: string;
  artistName: string;
  spotifyUrl?: string;
  onComplete: () => void;
  onPlay?: () => void;
  onPause?: () => void;
};

export function AlbumReveal({
  albumArt,
  trackName,
  artistName,
  spotifyUrl,
  onComplete,
  onPlay,
  onPause,
}: AlbumRevealProps) {
  const [dominantColor, setDominantColor] = useState<string>("rgb(168, 85, 247)");
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (albumArt) {
      extractDominantColor(albumArt)
        .then(setDominantColor)
        .catch(() => {});
    }

    const showTimer = setTimeout(() => setShow(true), 100);

    const playTimer = setTimeout(() => {
      onPlay?.();
      setPlaying(true);
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(playTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumArt]);

  const glow = createGlow(dominantColor, 1.5);

  const handleTogglePlay = () => {
    if (playing) {
      onPause?.();
      setPlaying(false);
    } else {
      onPlay?.();
      setPlaying(true);
    }
  };

  const handleNextRound = () => {
    onPause?.();
    setPlaying(false);
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Blurred album art background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${albumArt})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) brightness(0.2) saturate(1.4)",
          transform: "scale(1.2)",
        }}
        aria-hidden="true"
      />

      <div
        className={`text-center mx-auto transition-all duration-700 relative z-10 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        style={{
          padding: "0 24px",
          maxWidth: "640px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
        }}
      >
        {/* Album Art */}
        <div className="relative inline-block">
          <div
            className="absolute -inset-4 rounded-[var(--radius-xl)] blur-3xl opacity-40"
            style={{ backgroundColor: dominantColor }}
          />

          <img
            src={albumArt}
            alt={`${trackName} album art`}
            className="album-reveal relative rounded-[var(--radius-xl)] object-cover"
            style={{
              width: "clamp(240px, 40vw, 340px)",
              height: "clamp(240px, 40vw, 340px)",
              boxShadow: glow,
            }}
          />

          {playing && (
            <div
              className="absolute bottom-4 right-4 flex items-center rounded-full"
              style={{
                gap: "6px",
                padding: "6px 12px",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-end" style={{ gap: "2px", height: "12px" }}>
                <div className="rounded-full animate-pulse" style={{ width: "3px", height: "60%", background: "var(--accent)", animationDelay: "0ms" }} />
                <div className="rounded-full animate-pulse" style={{ width: "3px", height: "100%", background: "var(--accent)", animationDelay: "150ms" }} />
                <div className="rounded-full animate-pulse" style={{ width: "3px", height: "40%", background: "var(--accent)", animationDelay: "300ms" }} />
              </div>
              <span className="text-caption" style={{ color: "var(--text-primary)" }}>Preview</span>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div
          className="fade-in mx-auto"
          style={{
            animationDelay: "0.4s",
            maxWidth: "420px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <h3
            className="font-display"
            style={{
              fontSize: "clamp(20px, 4vw, 32px)",
              lineHeight: 1.2,
              color: "var(--text-primary)",
            }}
          >
            {trackName}
          </h3>
          <p className="text-body-1" style={{ color: "var(--text-secondary)" }}>
            {artistName}
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex items-center justify-center flex-wrap fade-in"
          style={{ animationDelay: "0.6s", gap: "16px" }}
        >
          <button
            onClick={handleTogglePlay}
            className="btn-icon cursor-pointer"
            aria-label={playing ? "Pause preview" : "Play preview"}
            style={{
              width: "56px",
              height: "56px",
              borderColor: dominantColor,
              color: dominantColor,
            }}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {spotifyUrl && (
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary cursor-pointer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Open in Spotify
            </a>
          )}

          <button
            onClick={handleNextRound}
            className="btn-arcade cursor-pointer"
          >
            Next Round
          </button>
        </div>
      </div>
    </div>
  );
}
