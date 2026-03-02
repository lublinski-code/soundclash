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

  return (
    <div
      className="flex-1 rounded-lg"
      style={{
        padding: "20px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <input
        type="text"
        value={team.name}
        onChange={(e) => updateTeamName(e.target.value)}
        className="w-full bg-transparent font-display outline-none"
        style={{
          fontSize: "20px",
          lineHeight: 1.3,
          color: "var(--text-primary)",
          border: "none",
          marginBottom: "16px",
        }}
        placeholder="Team Name"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
        {team.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg group transition-colors"
            style={{
              padding: "10px 14px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="text-body-2" style={{ color: "var(--text-primary)" }}>
              {member.name}
            </span>
            <button
              onClick={() => removeMember(member.id)}
              className="transition-colors opacity-50 group-hover:opacity-100 cursor-pointer"
              style={{
                color: "var(--text-muted)",
                fontSize: "16px",
                lineHeight: 1,
                background: "none",
                border: "none",
              }}
              aria-label={`Remove ${member.name}`}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
          placeholder="Add player"
          className="input flex-1"
          style={{ minHeight: "44px", fontSize: "14px" }}
        />
        <button
          onClick={addMember}
          disabled={!newMemberName.trim()}
          className="btn-secondary cursor-pointer"
          style={{ minHeight: "44px", padding: "0 20px" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function PlayerNameInput({
  player,
  onChange,
}: {
  player: Player;
  onChange: (name: string) => void;
}) {
  return (
    <div className="flex-1 relative">
      <input
        type="text"
        value={player.name}
        onChange={(e) => onChange(e.target.value)}
        className="w-full font-display text-center cursor-text"
        style={{
          fontSize: "clamp(18px, 3vw, 24px)",
          lineHeight: 1.3,
          color: "var(--text-primary)",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          outline: "none",
          transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
          minHeight: "56px",
        }}
        placeholder="Player name"
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-dim)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.boxShadow = "none";
        }}
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

  const headerRow = (
    <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
      <h2 className="text-subtitle-3" style={{ color: "var(--text-secondary)" }}>
        Players:
      </h2>
      {is1v1 ? (
        <button
          onClick={() => setExpanded(true)}
          className="btn-muted cursor-pointer text-caption"
        >
          Switch to teams
        </button>
      ) : (
        teams[0].members.length <= 1 && teams[1].members.length <= 1 && (
          <button
            onClick={() => setExpanded(false)}
            className="btn-muted cursor-pointer text-caption"
          >
            Switch to 1v1
          </button>
        )
      )}
    </div>
  );

  if (is1v1) {
    const p1 = teams[0].members[0] ?? { id: "default-p1", name: "Player 1" };
    const p2 = teams[1].members[0] ?? { id: "default-p2", name: "Player 2" };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {headerRow}
        <div className="flex flex-col sm:flex-row items-stretch" style={{ gap: "12px" }}>
          <PlayerNameInput
            player={p1}
            onChange={(name) => updatePlayerName(0, name)}
          />
          <div className="flex items-center justify-center" style={{ padding: "8px 0" }}>
            <span
              className="font-display"
              style={{
                fontSize: "32px",
                color: "var(--text-muted)",
              }}
            >
              VS
            </span>
          </div>
          <PlayerNameInput
            player={p2}
            onChange={(name) => updatePlayerName(1, name)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {headerRow}
      <div className="flex flex-col md:flex-row items-stretch" style={{ gap: "12px" }}>
        <TeamPanel team={teams[0]} teamIndex={0} onUpdate={updateTeam(0)} />
        <div className="flex items-center justify-center" style={{ padding: "8px 0" }}>
          <span
            className="font-display"
            style={{
              fontSize: "32px",
              color: "var(--text-muted)",
            }}
          >
            VS
          </span>
        </div>
        <TeamPanel team={teams[1]} teamIndex={1} onUpdate={updateTeam(1)} />
      </div>
    </div>
  );
}
