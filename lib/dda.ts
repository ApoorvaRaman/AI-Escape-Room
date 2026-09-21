import type { Tier } from "./types";

export interface PerformanceMetrics {
  timeOnStage: number; // seconds
  wrongAttempts: number;
  hintsUsed: number;
}

/**
 * Dynamic Difficulty Adjustment.
 *  - time_on_stage > 120s OR wrong_attempts >= 3  -> EASY
 *  - time_on_stage < 30s  AND wrong_attempts == 0 -> HARD
 *    (a stage solved/probed with hints is not "flawless", so hints block HARD)
 *  - otherwise                                     -> MEDIUM
 */
export function evaluateTier(m: PerformanceMetrics): Tier {
  if (m.timeOnStage > 120 || m.wrongAttempts >= 3) return "EASY";
  if (m.timeOnStage < 30 && m.wrongAttempts === 0 && m.hintsUsed === 0) return "HARD";
  return "MEDIUM";
}

export const TIER_CONFIG: Record<
  Tier,
  { label: string; confidenceThreshold: number; description: string; color: string }
> = {
  EASY: {
    label: "EASY",
    confidenceThreshold: 0.5,
    description: "Extra clues unlocked. Answer tolerance expanded.",
    color: "emerald",
  },
  MEDIUM: {
    label: "MEDIUM",
    confidenceThreshold: 0.65,
    description: "Standard puzzle parameters.",
    color: "cyan",
  },
  HARD: {
    label: "HARD",
    confidenceThreshold: 0.8,
    description: "Denser puzzles. Higher confidence required.",
    color: "rose",
  },
};
