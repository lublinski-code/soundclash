"use client";

import { useGameStore } from "@/store/gameStore";
import { HpBar } from "./HpBar";

export function HpHud() {
  const { teams, config, currentTeamIndex, roundNumber } = useGameStore();
  const team1 = teams[0];
  const team2 = teams[1];

  const activePlayer1 = team1.members[team1.activeIndex];
  const activePlayer2 = team2.members[team2.activeIndex];

  // 1v1 mode: each team has exactly 1 member
  const is1v1 = team1.members.length === 1 && team2.members.length === 1;

  return (
    <div className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-2">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
            Round {roundNumber}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <HpBar
            hp={team1.hp}
            maxHp={config.startingHp}
            label={is1v1 ? activePlayer1?.name ?? "Player 1" : team1.name}
            subLabel={is1v1 ? undefined : activePlayer1?.name}
            side="left"
            isActive={currentTeamIndex === 0}
          />

          <div className="text-lg font-black text-[var(--text-muted)] px-2 shrink-0">
            VS
          </div>

          <HpBar
            hp={team2.hp}
            maxHp={config.startingHp}
            label={is1v1 ? activePlayer2?.name ?? "Player 2" : team2.name}
            subLabel={is1v1 ? undefined : activePlayer2?.name}
            side="right"
            isActive={currentTeamIndex === 1}
          />
        </div>
      </div>
    </div>
  );
}
