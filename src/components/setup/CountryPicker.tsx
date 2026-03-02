"use client";

import { useGameStore } from "@/store/gameStore";
import { MARKETS } from "@/lib/game/constants";

export function CountryPicker() {
  const { config, setConfig } = useGameStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h3
        className="text-body-2"
        style={{ color: "var(--text-secondary)", fontWeight: 500 }}
      >
        Country Market
      </h3>
      <select
        value={config.market}
        onChange={(e) => setConfig({ market: e.target.value })}
        className="input cursor-pointer"
        style={{ fontSize: "14px", appearance: "none" }}
      >
        {MARKETS.map((market) => (
          <option key={market.code} value={market.code}>
            {market.label}
          </option>
        ))}
      </select>
      <p className="text-caption" style={{ color: "var(--text-muted)" }}>
        Filters songs available in this market
      </p>
    </div>
  );
}
