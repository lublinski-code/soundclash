"use client";

import { useGameStore } from "@/store/gameStore";
import { MARKETS } from "@/lib/game/constants";

export function CountryPicker() {
  const { config, setConfig } = useGameStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        Country / Market
      </h3>
      <select
        value={config.market}
        onChange={(e) => setConfig({ market: e.target.value })}
        className="w-full px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer"
      >
        {MARKETS.map((market) => (
          <option key={market.code} value={market.code}>
            {market.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-[var(--text-muted)]">
        Filters songs available in this market
      </p>
    </div>
  );
}
