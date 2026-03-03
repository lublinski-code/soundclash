import { DEFAULT_CORRECT_DAMAGE_TABLE, DEFAULT_WRONG_SELF_DAMAGE, ARTIST_ONLY_DAMAGE } from "./constants";

export { ARTIST_ONLY_DAMAGE };

export type DamageResult = {
  damage: number;
  /** true = guesser takes the damage; false = opponent takes the damage */
  targetSelf: boolean;
};

/**
 * Correct guess → opponent takes damage (higher for faster guesses).
 * Wrong / forfeit → guesser takes flat self-damage.
 */
export function calculateDamage(
  snippetLevel: number,
  correct: boolean,
  correctTable: number[] = DEFAULT_CORRECT_DAMAGE_TABLE,
  wrongSelfDamage: number = DEFAULT_WRONG_SELF_DAMAGE
): DamageResult {
  if (correct) {
    const idx = Math.min(snippetLevel, correctTable.length - 1);
    return { damage: correctTable[idx] ?? 3, targetSelf: false };
  }
  return { damage: wrongSelfDamage, targetSelf: true };
}

export type DamageLabel = "PERFECT" | "HIT" | "CLOSE" | "MISS";

export function getDamageLabel(damage: number, correct: boolean, artistOnly = false): DamageLabel {
  if (artistOnly) return "CLOSE";
  if (!correct) return "MISS";
  if (damage >= 25) return "PERFECT";
  return "HIT";
}
