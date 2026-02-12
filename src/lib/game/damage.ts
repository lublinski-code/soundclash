import { DEFAULT_DAMAGE_TABLE } from "./constants";

/**
 * Calculate damage based on snippet level and whether the guess was correct.
 * @param snippetLevel - Index into snippet durations (0 = first/shortest)
 * @param correct - Whether the guess was correct
 * @param damageTable - Custom damage table or default
 * @returns Damage amount (0 or positive number)
 */
export function calculateDamage(
  snippetLevel: number,
  correct: boolean,
  damageTable: number[] = DEFAULT_DAMAGE_TABLE
): number {
  if (correct) {
    // Correct guess: damage is based on how many snippets it took
    return damageTable[Math.min(snippetLevel, damageTable.length - 2)] ?? 0;
  }
  // Wrong or gave up: max damage (last entry in table)
  return damageTable[damageTable.length - 1] ?? 30;
}

/**
 * Get the label for a damage result
 */
export function getDamageLabel(damage: number): "PERFECT" | "HIT" | "MISS" {
  if (damage === 0) return "PERFECT";
  if (damage < 30) return "HIT";
  return "MISS";
}
