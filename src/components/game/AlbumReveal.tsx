"use client";

import { useEffect, useState } from "react";
import { extractDominantColor, createGlow } from "@/lib/utils/colorExtract";

type AlbumRevealProps = {
  albumArt: string;
  trackName: string;
  artistName: string;
  onComplete: () => void;
};

export function AlbumReveal({
  albumArt,
  trackName,
  artistName,
  onComplete,
}: AlbumRevealProps) {
  const [dominantColor, setDominantColor] = useState<string>("rgb(139, 92, 246)");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Extract dominant color from album art
    if (albumArt) {
      extractDominantColor(albumArt)
        .then(setDominantColor)
        .catch(() => {});
    }

    const showTimer = setTimeout(() => setShow(true), 100);
    const advanceTimer = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(advanceTimer);
    };
  }, [albumArt, onComplete]);

  const glow = createGlow(dominantColor, 1.2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] bg-opacity-95">
      <div
        className={`text-center space-y-6 transition-all duration-700 ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Album Art */}
        <div className="relative inline-block">
          {/* Glow behind */}
          <div
            className="absolute inset-0 rounded-xl blur-3xl opacity-50"
            style={{ backgroundColor: dominantColor }}
          />
          <img
            src={albumArt}
            alt={`${trackName} album art`}
            className="album-reveal relative w-64 h-64 md:w-80 md:h-80 rounded-xl object-cover"
            style={{
              boxShadow: glow,
            }}
          />
        </div>

        {/* Track Info */}
        <div className="space-y-2 fade-in" style={{ animationDelay: "0.4s" }}>
          <h3
            className="text-2xl md:text-3xl font-black text-[var(--text-primary)]"
            style={{
              textShadow: `0 0 20px ${dominantColor}`,
            }}
          >
            {trackName}
          </h3>
          <p className="text-lg text-[var(--text-secondary)]">{artistName}</p>
        </div>
      </div>
    </div>
  );
}
