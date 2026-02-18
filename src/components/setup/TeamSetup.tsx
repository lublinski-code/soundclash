"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import type { Player, Team } from "@/lib/game/types";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/** Full team panel with members list (shown when team has 2+ members) */
function TeamPanel({
  team,
  teamIndex,
  onUpdate,
}: {
  team: Team;
  teamIndex: 0 | 1;
  onUpdate: (team: Team) => void;
}) {
  const [newMemberName, setNewMemberName] = useState("");

  const addMember = () => {
    const name = newMemberName.trim();
    if (!name) return;
    const player: Player = { id: generateId(), name };
    onUpdate({ ...team, members: [...team.members, player] });
    setNewMemberName("");
  };

  const removeMember = (playerId: string) => {
    onUpdate({
      ...team,
      members: team.members.filter((m) => m.id !== playerId),
    });
  };

  const updateTeamName = (name: string) => {
    onUpdate({ ...team, name });
  };

  const isLeft = teamIndex === 0;
  const sideColor = isLeft ? "var(--hp-full)" : "var(--hp-low)";
  const glowColor = isLeft ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";

  return (
    <div
      className="flex-1 p-6 rounded-xl border bg-[var(--bg-secondary)] transition-all hover:border-opacity-80"
      style={{
        borderColor: sideColor,
        borderTopWidth: "3px",
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      <input
        type="text"
        value={team.name}
        onChange={(e) => updateTeamName(e.target.value)}
        className="w-full bg-transparent text-xl font-bold text-[var(--text-primary)] border-none outline-none mb-4 placeholder:text-[var(--text-muted)]"
        placeholder="Team Name"
      />

      <div className="space-y-2 mb-4">
        {team.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] group hover:border-[var(--border-default)] transition-colors"
          >
            <span className="text-sm text-[var(--text-primary)]">{member.name}</span>
            <button
              onClick={() => removeMember(member.id)}
              className="text-[var(--text-muted)] hover:text-[var(--flash-miss)] transition-colors text-sm opacity-50 group-hover:opacity-100 cursor-pointer"
              aria-label="Remove member"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
          placeholder="Add player"
          className="input flex-1 min-h-[40px] text-sm"
        />
        <button
          onClick={addMember}
          disabled={!newMemberName.trim()}
          className="btn-secondary min-h-[40px] px-4 cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/** Simple 1v1 player name editor */
function PlayerNameInput({
  player,
  side,
  onChange,
}: {
  player: Player;
  side: "left" | "right";
  onChange: (name: string) => void;
}) {
  const color = side === "left" ? "var(--hp-full)" : "var(--hp-low)";
  const glowColor = side === "left" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";

  return (
    <div
      className="flex-1 p-5 rounded-xl border bg-[var(--bg-secondary)] transition-all"
      style={{
        borderColor: color,
        borderTopWidth: "3px",
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      <input
        type="text"
        value={player.name}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-xl font-bold text-[var(--text-primary)] border-none outline-none text-center placeholder:text-[var(--text-muted)]"
        placeholder="Player name"
      />
    </div>
  );
}

export function TeamSetup() {
  const { teams, setTeams } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  const is1v1 =
    teams[0].members.length <= 1 && teams[1].members.length <= 1 && !expanded;

  const updateTeam = (index: 0 | 1) => (team: Team) => {
    const newTeams = [...teams] as [Team, Team];
    newTeams[index] = team;
    setTeams(newTeams);
  };

  const updatePlayerName = (teamIdx: 0 | 1, name: string) => {
    const team = teams[teamIdx];
    const player = team.members[0] ?? { id: `default-p${teamIdx + 1}`, name };
    const updatedTeam: Team = {
      ...team,
      name,
      members: [{ ...player, name }],
    };
    const newTeams = [...teams] as [Team, Team];
    newTeams[teamIdx] = updatedTeam;
    setTeams(newTeams);
  };

  if (is1v1) {
    const p1 = teams[0].members[0] ?? { id: "default-p1", name: "Player 1" };
    const p2 = teams[1].members[0] ?? { id: "default-p2", name: "Player 2" };

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setExpanded(true)}
            className="btn-muted text-xs cursor-pointer"
          >
            Switch to Teams →
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <PlayerNameInput
            player={p1}
            side="left"
            onChange={(name) => updatePlayerName(0, name)}
          />
          <div className="flex items-center justify-center py-2 md:py-0">
            <span className="font-retro text-3xl text-[var(--accent)] neon-glow-sm glitch-hover">VS</span>
          </div>
          <PlayerNameInput
            player={p2}
            side="right"
            onChange={(name) => updatePlayerName(1, name)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {expanded && teams[0].members.length <= 1 && teams[1].members.length <= 1 && (
          <button
            onClick={() => setExpanded(false)}
            className="btn-muted text-xs cursor-pointer"
          >
            ← Switch to 1v1
          </button>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <TeamPanel team={teams[0]} teamIndex={0} onUpdate={updateTeam(0)} />
        <div className="flex items-center justify-center py-2 md:py-0">
          <span className="font-retro text-3xl text-[var(--accent)] neon-glow-sm glitch-hover">VS</span>
        </div>
        <TeamPanel team={teams[1]} teamIndex={1} onUpdate={updateTeam(1)} />
      </div>
    </div>
  );
}
