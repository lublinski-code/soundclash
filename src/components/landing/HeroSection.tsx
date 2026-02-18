"use client";

export function HeroSection() {
  return (
    <div className="text-center space-y-6 relative">
      {/* Logo / Title */}
      <div className="space-y-4">
        <h1 className="font-retro text-7xl md:text-9xl tracking-wider text-[var(--text-primary)] neon-pulse">
          SOUND
          <span className="text-[var(--accent)]">CLASH</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-muted)] font-medium">
            Music Guessing Battle
          </p>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
        </div>
      </div>

      {/* Tagline */}
      <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
        Two teams. Progressive snippets. One song to guess.
        <br />
        <span className="text-[var(--text-muted)]">Last team standing wins.</span>
      </p>

      {/* VS Graphic */}
      <div className="flex items-center justify-center gap-6 py-6">
        <div className="w-20 h-1 rounded-full bg-gradient-to-r from-transparent via-[var(--hp-full)] to-[var(--hp-full)] shadow-[0_0_10px_var(--hp-full)]" />
        <span className="font-retro text-4xl text-[var(--accent)] glitch-hover neon-glow-sm">
          VS
        </span>
        <div className="w-20 h-1 rounded-full bg-gradient-to-l from-transparent via-[var(--hp-low)] to-[var(--hp-low)] shadow-[0_0_10px_var(--hp-low)]" />
      </div>
    </div>
  );
}
