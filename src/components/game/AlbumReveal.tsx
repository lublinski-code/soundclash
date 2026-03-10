"use client";

import { useEffect, useState } from "react";
import { extractDominantColor, createGlow } from "@/lib/utils/colorExtract";

const PLATFORMS = [
  {
    name: "Deezer",
    buildUrl: (_q: string, songUrl: string) => songUrl,
    color: "#A238FF",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.19V8.38H6.27zm12.54 0v3.027H24V8.38h-5.19zM6.27 12.594v3.027h5.19v-3.027H6.27zm6.27 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19v-3.03H0zm6.27 0v3.029h5.19v-3.03H6.27zm6.27 0v3.029h5.19v-3.03h-5.19zm6.27 0v3.029H24v-3.03h-5.19z" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    buildUrl: (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    color: "#1DB954",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    name: "Apple Music",
    buildUrl: (q: string) => `https://music.apple.com/search?term=${encodeURIComponent(q)}`,
    color: "#FA243C",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.197 10.496 10.496 0 0018.21.006h-6.666a44.136 44.136 0 00-1.593.012c-.5.014-.999.07-1.492.17a4.972 4.972 0 00-1.874.783A5.06 5.06 0 004.73 2.838c-.317.697-.48 1.442-.527 2.208a29.098 29.098 0 00-.093 1.464v10.972c.014.515.062 1.028.15 1.535.2.996.658 1.876 1.34 2.622a5.005 5.005 0 002.37 1.458c.527.146 1.067.224 1.613.257.515.032 1.03.043 1.546.047h7.198c.508-.008 1.018-.027 1.527-.064a6.063 6.063 0 001.44-.238 4.87 4.87 0 002.24-1.38c.67-.743 1.1-1.604 1.297-2.572.108-.54.163-1.087.178-1.637.013-.478.02-.957.023-1.435V6.124zm-6.423 2.06v7.394c0 .508-.078.993-.312 1.442a2.347 2.347 0 01-1.22 1.075 3.09 3.09 0 01-.8.213c-.645.086-1.253-.013-1.81-.352a1.804 1.804 0 01-.863-1.14 1.839 1.839 0 01.137-1.3c.236-.471.626-.795 1.105-1.005.363-.16.75-.263 1.138-.353.27-.063.54-.13.805-.206.26-.074.46-.218.578-.478a1.28 1.28 0 00.104-.538V8.208a.65.65 0 00-.052-.28.483.483 0 00-.39-.31c-.1-.019-.2-.028-.3-.032-.48-.018-.96.025-1.434.08-.694.082-1.386.172-2.077.27-.614.086-1.228.176-1.84.271-.198.03-.294.147-.318.35a3.076 3.076 0 00-.023.39v8.093c0 .481-.065.95-.27 1.387a2.397 2.397 0 01-1.127 1.111c-.353.17-.73.264-1.118.305-.643.07-1.254-.01-1.82-.358a1.798 1.798 0 01-.847-1.127 1.842 1.842 0 01.129-1.308c.232-.468.622-.792 1.099-1a8.208 8.208 0 011.136-.345c.278-.065.555-.133.829-.21.254-.072.45-.214.567-.47a1.167 1.167 0 00.104-.525V5.578c0-.27.048-.528.2-.756a.946.946 0 01.53-.38c.263-.076.533-.12.804-.16.663-.096 1.328-.182 1.993-.266.644-.081 1.29-.158 1.935-.232.544-.063 1.088-.122 1.633-.177.192-.02.384-.027.576-.032a.604.604 0 01.538.274c.084.128.117.275.117.432v1.004z" />
      </svg>
    ),
  },
  {
    name: "YouTube Music",
    buildUrl: (q: string) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}`,
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
      </svg>
    ),
  },
  {
    name: "Tidal",
    buildUrl: (q: string) => `https://tidal.com/browse/search/${encodeURIComponent(q)}`,
    color: "#00FFFF",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 8l4.004 4 4.004-4-4.004-4.004zm4.004 4.004l-4.004 4.004 4.004 4.004L20.02 12l-4.004-4.004zm-8.008 0L4.004 12l4.004 4.004L12.012 12 8.008 7.996zM12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12z" />
      </svg>
    ),
  },
  {
    name: "Amazon Music",
    buildUrl: (q: string) => `https://music.amazon.com/search/${encodeURIComponent(q)}`,
    color: "#FF9900",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 01-.753.077c-1.058-.878-1.247-1.287-1.827-2.122-1.748 1.783-2.986 2.315-5.249 2.315-2.68 0-4.764-1.653-4.764-4.96 0-2.583 1.4-4.339 3.393-5.2 1.726-.752 4.14-.886 5.98-1.093v-.41c0-.751.058-1.64-.383-2.29-.385-.578-1.124-.815-1.775-.815-1.205 0-2.277.618-2.54 1.897-.054.284-.261.564-.547.578l-3.064-.33c-.258-.057-.544-.266-.47-.662C5.962 1.408 9.26 0 12.232 0c1.472 0 3.396.39 4.556 1.502 1.472 1.39 1.332 3.247 1.332 5.27v4.772c0 1.434.595 2.063 1.154 2.838.197.278.24.612-.01.819-.624.522-1.734 1.49-2.346 2.033l-.006-.005-.768.562zM21.779 20.799C19.476 22.59 16.023 24 13.151 24c-4.082 0-7.76-1.508-10.539-4.017-.218-.197-.024-.466.238-.314 3 1.751 6.718 2.804 10.556 2.804 2.588 0 5.434-.537 8.053-1.647.395-.172.726.257.32.573z" />
      </svg>
    ),
  },
];

type AlbumRevealProps = {
  albumArt: string;
  trackName: string;
  artistName: string;
  songUrl?: string;
  onComplete: () => void;
  onPlay?: () => void;
  onPause?: () => void;
};

export function AlbumReveal({
  albumArt,
  trackName,
  artistName,
  songUrl,
  onComplete,
  onPlay,
  onPause,
}: AlbumRevealProps) {
  const [dominantColor, setDominantColor] = useState<string>("rgb(168, 85, 247)");
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(false);

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

  const searchQuery = `${artistName} ${trackName}`;

  const handlePlatformClick = (url: string) => {
    onPause?.();
    setPlaying(false);
    window.open(url, "_blank", "noopener");
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
          className="flex flex-col items-center fade-in"
          style={{ animationDelay: "0.6s", gap: "16px", width: "100%" }}
        >
          <div className="flex items-center justify-center flex-wrap" style={{ gap: "16px" }}>
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

            {songUrl && (
              <button
                onClick={() => setPlatformsOpen(!platformsOpen)}
                className="btn-secondary cursor-pointer"
                aria-expanded={platformsOpen}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Listen Full Song
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  style={{
                    transition: "transform 200ms ease",
                    transform: platformsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}

            <button
              onClick={handleNextRound}
              className="btn-arcade cursor-pointer"
            >
              Next Round
            </button>
          </div>

          {/* Platform picker */}
          {platformsOpen && songUrl && (
            <div
              className="w-full fade-in"
              style={{
                maxWidth: "460px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {PLATFORMS.map((platform) => {
                const url = platform.buildUrl(searchQuery, songUrl);
                return (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformClick(url)}
                    className="cursor-pointer"
                    aria-label={`Open on ${platform.name}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 8px",
                      borderRadius: "var(--radius-md)",
                      background: "transparent",
                      border: "1px solid transparent",
                      color: "var(--text-secondary)",
                      transition: "all 150ms ease",
                      minHeight: "44px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                      e.currentTarget.style.color = platform.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                      e.currentTarget.style.color = platform.color;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    {platform.icon}
                    <span style={{ fontSize: "12px", lineHeight: "1.5" }}>{platform.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
