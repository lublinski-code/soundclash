"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import type { Player, Team } from "@/lib/game/types";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

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
    onUpdate({
      ...team,
      members: [...team.members, player],
    });
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

  const sideColor = teamIndex === 0 ? "var(--hp-full)" : "var(--hp-low)";

  return (
    <div
      className="flex-1 p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]"
      style={{ borderTopColor: sideColor, borderTopWidth: "2px" }}
    >
      {/* Team Name */}
      <input
        type="text"
        value={team.name}
        onChange={(e) => updateTeamName(e.target.value)}
        className="w-full bg-transparent text-xl font-bold text-[var(--text-primary)] border-none outline-none mb-4 placeholder:text-[var(--text-muted)]"
        placeholder="Team Name"
      />

      {/* Members List */}
      <div className="space-y-2 mb-4">
        {team.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
          >
            <span className="text-sm text-[var(--text-primary)]">{member.name}</span>
            <button
              onClick={() => removeMember(member.id)}
              className="text-[var(--text-muted)] hover:text-[var(--flash-miss)] transition-colors text-sm"
              aria-label="Remove member"
            >
              &times;
            </button>
          </div>
        ))}

        {team.members.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-4">
            No members yet. Add at least one player.
          </p>
        )}
      </div>

      {/* Add Member */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
          placeholder="Player name"
          className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={addMember}
          disabled={!newMemberName.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export function TeamSetup() {
  const { teams, setTeams } = useGameStore();

  const updateTeam = (index: 0 | 1) => (team: Team) => {
    const newTeams = [...teams] as [Team, Team];
    newTeams[index] = team;
    setTeams(newTeams);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider">
        Teams
      </h2>
      <div className="flex gap-4 items-stretch">
        <TeamPanel team={teams[0]} teamIndex={0} onUpdate={updateTeam(0)} />
        <div className="flex items-center">
          <span className="text-2xl font-black text-[var(--text-muted)]">VS</span>
        </div>
        <TeamPanel team={teams[1]} teamIndex={1} onUpdate={updateTeam(1)} />
      </div>
    </div>
  );
}
