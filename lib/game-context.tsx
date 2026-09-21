"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { evaluateTier } from "./dda";
import {
  EMPTY_BREAKDOWN,
  SCORING,
  finalScore,
  hintPenalty,
  speedBonus,
  stageAllocatedTime,
  type ScoreBreakdown,
} from "./scoring";
import { STAGES, TOTAL_STAGES, getStage } from "./stages";
import type { ConsoleMessage, StageMeta, Tier } from "./types";
import { uid } from "./utils";

export interface StageResult {
  stageId: number;
  timeSpent: number;
  wrong: number;
  hints: number;
  base: number;
  speed: number;
  bonus: number;
  hintPenalty: number;
  wrongPenalty: number;
}

export interface GameState {
  status: "idle" | "playing" | "won" | "lost";
  phase: "solving" | "cleared";
  playerId: string;
  totalTime: number;
  timeLeft: number;
  stageIndex: number;
  stageElapsed: number;
  wrongInStage: number;
  hintsInStage: number;
  stagePenalty: { hint: number; wrong: number };
  tier: Tier;
  nextTier: Tier;
  breakdown: ScoreBreakdown;
  results: StageResult[];
  lastCleared: StageResult | null;
  messages: ConsoleMessage[];
  totalWrong: number;
  totalHints: number;
}

const initialState: GameState = {
  status: "idle",
  phase: "solving",
  playerId: "",
  totalTime: 900,
  timeLeft: 900,
  stageIndex: 0,
  stageElapsed: 0,
  wrongInStage: 0,
  hintsInStage: 0,
  stagePenalty: { hint: 0, wrong: 0 },
  tier: "MEDIUM",
  nextTier: "MEDIUM",
  breakdown: EMPTY_BREAKDOWN,
  results: [],
  lastCleared: null,
  messages: [],
  totalWrong: 0,
  totalHints: 0,
};

type Action =
  | { type: "START"; playerId: string; totalTime: number }
  | { type: "TICK" }
  | { type: "WRONG" }
  | { type: "CORRECT" }
  | { type: "NEXT" }
  | { type: "HINT_USED" }
  | { type: "ADD_MESSAGE"; message: Omit<ConsoleMessage, "id" | "ts"> }
  | { type: "RESET" };

function msg(m: Omit<ConsoleMessage, "id" | "ts">): ConsoleMessage {
  return { ...m, id: uid(), ts: Date.now() };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START": {
      return {
        ...initialState,
        status: "playing",
        playerId: action.playerId,
        totalTime: action.totalTime,
        timeLeft: action.totalTime,
        messages: [
          msg({
            role: "system",
            kind: "info",
            content: `Lab link established. ${TOTAL_STAGES} stages, ${Math.floor(action.totalTime / 60)} minutes. Request a hint any time (costs points).`,
          }),
        ],
      };
    }

    case "TICK": {
      if (state.status !== "playing" || state.phase !== "solving") return state;
      const timeLeft = state.timeLeft - 1;
      const stageElapsed = state.stageElapsed + 1;
      if (timeLeft <= 0) {
        return {
          ...state,
          timeLeft: 0,
          stageElapsed,
          status: "lost",
          messages: [...state.messages, msg({ role: "system", kind: "error", content: "Countdown reached zero. The lab is sealed." })],
        };
      }
      let tier = state.tier;
      if (tier === "HARD" && stageElapsed >= 30) tier = "MEDIUM";
      else if (tier !== "EASY" && stageElapsed > 120) tier = "EASY";
      return { ...state, timeLeft, stageElapsed, tier };
    }

    case "WRONG": {
      if (state.status !== "playing" || state.phase !== "solving") return state;
      const wrongInStage = state.wrongInStage + 1;
      const tier = evaluateTier({
        timeOnStage: state.stageElapsed,
        wrongAttempts: wrongInStage,
        hintsUsed: state.hintsInStage,
      });
      return {
        ...state,
        wrongInStage,
        totalWrong: state.totalWrong + 1,
        tier,
        stagePenalty: { ...state.stagePenalty, wrong: state.stagePenalty.wrong + SCORING.WRONG_PENALTY },
        breakdown: { ...state.breakdown, wrongPenalty: state.breakdown.wrongPenalty + SCORING.WRONG_PENALTY },
        messages: [
          ...state.messages,
          msg({ role: "system", kind: "error", content: `Incorrect. -${SCORING.WRONG_PENALTY} points. Wrong attempts this stage: ${wrongInStage}.` }),
        ],
      };
    }

    case "HINT_USED": {
      if (state.status !== "playing" || state.phase !== "solving") return state;
      const penalty = hintPenalty(state.hintsInStage);
      const hintsInStage = state.hintsInStage + 1;
      const tier = evaluateTier({
        timeOnStage: state.stageElapsed,
        wrongAttempts: state.wrongInStage,
        hintsUsed: hintsInStage,
      });
      return {
        ...state,
        hintsInStage,
        totalHints: state.totalHints + 1,
        tier,
        stagePenalty: { ...state.stagePenalty, hint: state.stagePenalty.hint + penalty },
        breakdown: { ...state.breakdown, hintPenalty: state.breakdown.hintPenalty + penalty },
      };
    }

    case "CORRECT": {
      if (state.status !== "playing" || state.phase !== "solving") return state;
      const allocated = stageAllocatedTime(state.totalTime, TOTAL_STAGES);
      const remaining = Math.max(0, allocated - state.stageElapsed);
      const speed = speedBonus(remaining, allocated);
      const isFinal = state.stageIndex === TOTAL_STAGES - 1;
      const bonus = isFinal ? SCORING.ESCAPE_BONUS : 0;
      const result: StageResult = {
        stageId: state.stageIndex + 1,
        timeSpent: state.stageElapsed,
        wrong: state.wrongInStage,
        hints: state.hintsInStage,
        base: SCORING.STAGE_BASE,
        speed,
        bonus,
        hintPenalty: state.stagePenalty.hint,
        wrongPenalty: state.stagePenalty.wrong,
      };
      const nextTier = evaluateTier({
        timeOnStage: state.stageElapsed,
        wrongAttempts: state.wrongInStage,
        hintsUsed: state.hintsInStage,
      });
      return {
        ...state,
        phase: "cleared",
        status: isFinal ? "won" : "playing",
        nextTier,
        lastCleared: result,
        results: [...state.results, result],
        breakdown: {
          ...state.breakdown,
          correctness: state.breakdown.correctness + SCORING.STAGE_BASE,
          speed: state.breakdown.speed + speed,
          bonus: state.breakdown.bonus + bonus,
        },
        messages: [
          ...state.messages,
          msg({
            role: "system",
            kind: "success",
            content: `Stage ${result.stageId} cleared. +${SCORING.STAGE_BASE} base, +${speed} speed${bonus ? `, +${bonus} escape bonus` : ""}.`,
          }),
        ],
      };
    }

    case "NEXT": {
      if (state.status !== "playing" || state.phase !== "cleared") return state;
      return {
        ...state,
        phase: "solving",
        stageIndex: state.stageIndex + 1,
        stageElapsed: 0,
        wrongInStage: 0,
        hintsInStage: 0,
        stagePenalty: { hint: 0, wrong: 0 },
        tier: state.nextTier,
        lastCleared: null,
      };
    }

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, msg(action.message)] };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  stage: StageMeta;
  allocated: number;
  score: number;
  stageTimeRemaining: number;
  hintLoading: boolean;
  nextHintPenalty: number;
  start: (playerId: string, totalTime: number) => void;
  submitAttempt: (correct: boolean) => void;
  nextStage: () => void;
  requestHint: (question?: string) => Promise<void>;
  reset: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hintLoading, setHintLoading] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const announcedStage = useRef<number>(-1);
  const submittedRef = useRef(false);

  // Countdown: ticks only while a stage is actively being solved.
  useEffect(() => {
    if (state.status !== "playing" || state.phase !== "solving") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.status, state.phase]);

  // DDA: entering EASY tier auto-delivers a free contextual note (once per stage).
  useEffect(() => {
    if (state.status !== "playing" || state.phase !== "solving") return;
    if (state.tier === "EASY" && announcedStage.current !== state.stageIndex) {
      announcedStage.current = state.stageIndex;
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "assistant",
          kind: "auto",
          content: `Difficulty lowered to EASY. Free context: ${getStage(state.stageIndex).easyContext}`,
        },
      });
    }
  }, [state.tier, state.stageIndex, state.status, state.phase]);

  // Submit the run to the leaderboard once it ends.
  useEffect(() => {
    if (state.status === "idle") {
      submittedRef.current = false;
      return;
    }
    if ((state.status === "won" || state.status === "lost") && !submittedRef.current) {
      submittedRef.current = true;
      const s = stateRef.current;
      fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: s.playerId,
          score: finalScore(s.breakdown),
          escaped: s.status === "won",
          stagesCleared: s.results.length,
          timeUsed: s.totalTime - s.timeLeft,
          wrong: s.totalWrong,
          hints: s.totalHints,
        }),
      }).catch(() => undefined);
    }
  }, [state.status]);

  const start = useCallback((playerId: string, totalTime: number) => {
    announcedStage.current = -1;
    dispatch({ type: "START", playerId, totalTime });
  }, []);

  const submitAttempt = useCallback((correct: boolean) => {
    dispatch({ type: correct ? "CORRECT" : "WRONG" });
  }, []);

  const nextStage = useCallback(() => dispatch({ type: "NEXT" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const requestHint = useCallback(async (question?: string) => {
    const s = stateRef.current;
    if (s.status !== "playing" || s.phase !== "solving") return;
    const level = s.hintsInStage + 1;
    const q = question?.trim() || undefined;
    if (q) dispatch({ type: "ADD_MESSAGE", message: { role: "user", kind: "question", content: q } });
    dispatch({ type: "HINT_USED" });
    setHintLoading(true);
    try {
      const res = await fetch("/api/rag-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: s.stageIndex + 1, hintLevel: level, question: q, tier: s.tier }),
      });
      if (!res.ok) throw new Error("hint failed");
      const data = (await res.json()) as { hint: string; sources: { id: string; title: string }[] };
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "assistant",
          kind: "hint",
          content: data.hint,
          sources: data.sources.map((x) => x.title),
        },
      });
    } catch {
      const st = getStage(s.stageIndex);
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "assistant",
          kind: "hint",
          content: `Offline nudge: ${st.hintLadder[Math.min(level, 3) - 1]}`,
        },
      });
    } finally {
      setHintLoading(false);
    }
  }, []);

  const allocated = stageAllocatedTime(state.totalTime, TOTAL_STAGES);
  const value = useMemo<GameContextValue>(
    () => ({
      state,
      stage: STAGES[Math.min(state.stageIndex, TOTAL_STAGES - 1)],
      allocated,
      score: finalScore(state.breakdown),
      stageTimeRemaining: Math.max(0, allocated - state.stageElapsed),
      hintLoading,
      nextHintPenalty: hintPenalty(state.hintsInStage),
      start,
      submitAttempt,
      nextStage,
      requestHint,
      reset,
    }),
    [state, allocated, hintLoading, start, submitAttempt, nextStage, requestHint, reset]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
