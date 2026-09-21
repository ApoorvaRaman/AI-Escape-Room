/**
 * Final Score = Correctness Points + Speed Bonus - Hint Penalties - Wrong Attempt Penalties
 * (+ Final Escape Completion Bonus, tracked as `bonus`).
 */
export const SCORING = {
  STAGE_BASE: 100,
  MAX_SPEED_BONUS: 50,
  HINT_PENALTIES: [10, 20, 30] as const, // 1st, 2nd, 3rd+
  WRONG_PENALTY: 5,
  ESCAPE_BONUS: 200,
} as const;

export interface ScoreBreakdown {
  correctness: number;
  speed: number;
  hintPenalty: number;
  wrongPenalty: number;
  bonus: number;
}

export const EMPTY_BREAKDOWN: ScoreBreakdown = {
  correctness: 0,
  speed: 0,
  hintPenalty: 0,
  wrongPenalty: 0,
  bonus: 0,
};

/** Math.max(0, Math.floor((Time Remaining in Stage / Stage Allocated Time) * 50)) */
export function speedBonus(timeRemainingInStage: number, stageAllocatedTime: number): number {
  if (stageAllocatedTime <= 0) return 0;
  return Math.max(0, Math.floor((timeRemainingInStage / stageAllocatedTime) * SCORING.MAX_SPEED_BONUS));
}

/** hintsAlreadyUsedInStage: 0 -> -10, 1 -> -20, 2+ -> -30 */
export function hintPenalty(hintsAlreadyUsedInStage: number): number {
  const idx = Math.min(hintsAlreadyUsedInStage, SCORING.HINT_PENALTIES.length - 1);
  return SCORING.HINT_PENALTIES[idx];
}

export function finalScore(b: ScoreBreakdown): number {
  return Math.max(0, b.correctness + b.speed + b.bonus - b.hintPenalty - b.wrongPenalty);
}

export function stageAllocatedTime(totalTime: number, totalStages = 8): number {
  return Math.floor(totalTime / totalStages);
}
