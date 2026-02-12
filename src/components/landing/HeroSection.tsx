"use client";

export function HeroSection() {
  return (
    <div className="text-center space-y-6">
      {/* Logo / Title */}
      <div className="space-y-2">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[var(--text-primary)]">
          SOUND
          <span className="text-[var(--accent)]">CLASH</span>
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[var(--border-default)]" />
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)] font-medium">
            Music Guessing Battle
          </p>
          <div className="h-px w-12 bg-[var(--border-default)]" />
        </div>
      </div>

      {/* Tagline */}
      <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
        Two teams. Progressive snippets. One song to guess.
        <br />
        <span className="text-[var(--text-muted)]">Last team standing wins.</span>
      </p>

      {/* VS Graphic */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[var(--hp-full)] rounded" />
        <span className="text-2xl font-black text-[var(--text-muted)]">VS</span>
        <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[var(--hp-low)] rounded" />
      </div>
    </div>
  );
}
