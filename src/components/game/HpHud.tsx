"use client";

import { useGameStore } from "@/store/gameStore";
import { HpBar } from "./HpBar";

export function HpHud() {
  const { teams, config, currentTeamIndex, roundNumber } = useGameStore();
  const team1 = teams[0];
  const team2 = teams[1];

  const activePlayer1 = team1.members[team1.activeIndex];
  const activePlayer2 = team2.members[team2.activeIndex];

  const is1v1 = team1.members.length === 1 && team2.members.length === 1;

  return (
    <div className="w-full relative z-10" style={{ padding: "24px 32px 0" }}>
      {/* Round label — left on mobile (avoids End Game overlap), centered on desktop */}
      <div className="text-left sm:text-center" style={{ marginBottom: "16px" }}>
        <span
          className="font-display"
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            lineHeight: 1.2,
            color: "var(--light-blue)",
          }}
        >
          Round {roundNumber}
        </span>
      </div>

      {/* HP bars row — full width, flat */}
      <div className="flex items-end" style={{ gap: "0" }}>
        <HpBar
          hp={team1.hp}
          maxHp={config.startingHp}
          label={is1v1 ? (activePlayer1?.name ?? "Player 1") : team1.name}
          subLabel={is1v1 ? undefined : activePlayer1?.name}
          side="left"
          isActive={currentTeamIndex === 0}
        />

        {/* VS — centered, aligned with bar height */}
        <div
          className="font-display shrink-0 flex items-end justify-center"
          style={{
            fontSize: "clamp(20px, 3vw, 48px)",
            lineHeight: 1.2,
            color: "var(--text-muted)",
            minWidth: "clamp(48px, 6vw, 80px)",
            paddingBottom: "8px",
          }}
        >
          VS
        </div>

        <HpBar
          hp={team2.hp}
          maxHp={config.startingHp}
          label={is1v1 ? (activePlayer2?.name ?? "Player 2") : team2.name}
          subLabel={is1v1 ? undefined : activePlayer2?.name}
          side="right"
          isActive={currentTeamIndex === 1}
        />
      </div>
    </div>
  );
}
