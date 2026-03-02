import { DEFAULT_DAMAGE_TABLE } from "./constants";

/** Fixed damage when the player knows the artist but not the song */
export const ARTIST_ONLY_DAMAGE = 15;

export function calculateDamage(
  snippetLevel: number,
  correct: boolean,
  damageTable: number[] = DEFAULT_DAMAGE_TABLE
): number {
  if (correct) {
    return damageTable[Math.min(snippetLevel, damageTable.length - 2)] ?? 0;
  }
  return damageTable[damageTable.length - 1] ?? 30;
}

export type DamageLabel = "PERFECT" | "HIT" | "CLOSE" | "MISS";

export function getDamageLabel(damage: number, artistOnly = false): DamageLabel {
  if (damage === 0) return "PERFECT";
  if (artistOnly) return "CLOSE";
  if (damage < 30) return "HIT";
  return "MISS";
}
