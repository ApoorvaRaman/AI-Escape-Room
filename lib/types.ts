export type Tier = "EASY" | "MEDIUM" | "HARD";

export interface StageMeta {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  briefing: string;
  easyClue: string;
  hardTwist: string;
  retrievalQuery: string;
  hintLadder: [string, string, string];
  easyContext: string;
}

export interface PuzzleProps {
  tier: Tier;
  disabled: boolean;
  onAttempt: (correct: boolean) => void;
}

export interface ConsoleMessage {
  id: string;
  role: "assistant" | "system" | "user";
  kind: "hint" | "auto" | "info" | "success" | "error" | "question";
  content: string;
  sources?: string[];
  ts: number;
}

export interface EvaluationResult {
  is_correct: boolean;
  confidence: number;
  feedback: string;
}

export interface LeaderboardEntry {
  id: string;
  playerId: string;
  score: number;
  escaped: boolean;
  stagesCleared: number;
  timeUsed: number;
  wrong: number;
  hints: number;
  createdAt: number;
}

export interface KBEntry {
  id: string;
  title: string;
  stages: number[];
  text: string;
}
