"use client";

export function HeroSection() {
  return (
    <div className="text-center relative" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1
        className="font-display text-gold-3d"
        style={{
          fontSize: "clamp(48px, 10vw, 96px)",
          lineHeight: 1.1,
        }}
      >
        SoundClash
      </h1>
      <p
        className="text-subtitle-2"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        The ultimate Music battle
      </p>
    </div>
  );
}
