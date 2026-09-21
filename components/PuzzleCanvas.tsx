"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useGame } from "@/lib/game-context";
import { PUZZLES } from "./puzzles";
import { Panel, TierBadge } from "./ui";

export default function PuzzleCanvas() {
  const { state, stage, submitAttempt, nextStage, allocated } = useGame();
  const Puzzle = PUZZLES[state.stageIndex];
  const cleared = state.phase === "cleared" && state.lastCleared;
  const r = state.lastCleared;

  return (
    <Panel className="p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-cyan-400">Stage {stage.id}</p>
          <h2 className="text-xl font-semibold text-slate-50">{stage.title}</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">{stage.briefing}</p>
        </div>
        <div className="text-right">
          <TierBadge tier={state.tier} />
          <p className="mt-1 font-mono text-xs text-slate-500">stage budget {Math.floor(allocated / 60)}:{String(allocated % 60).padStart(2, "0")}</p>
        </div>
      </div>

      {state.tier === "EASY" && !cleared && (
        <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">Easy tier: {stage.easyClue}</p>
      )}
      {state.tier === "HARD" && !cleared && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">Hard tier: {stage.hardTwist}</p>
      )}

      {cleared && r ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
            <h3 className="text-lg font-semibold">Stage {r.stageId} cleared</h3>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-slate-500">Base</dt><dd className="text-emerald-400">+{r.base}</dd></div>
            <div><dt className="text-xs text-slate-500">Speed bonus</dt><dd className="text-emerald-400">+{r.speed}</dd></div>
            <div><dt className="text-xs text-slate-500">Time used</dt><dd>{r.timeSpent}s</dd></div>
            <div><dt className="text-xs text-slate-500">Hint penalties</dt><dd className="text-rose-400">-{r.hintPenalty}</dd></div>
            <div><dt className="text-xs text-slate-500">Wrong attempts</dt><dd className="text-rose-400">{r.wrong} (-{r.wrongPenalty})</dd></div>
            <div><dt className="text-xs text-slate-500">Next difficulty</dt><dd><TierBadge tier={state.nextTier} /></dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">The countdown is paused until you continue.</p>
          <button onClick={nextStage} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
            Continue to stage {r.stageId + 1} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      ) : (
        <Puzzle key={state.stageIndex} tier={state.tier} disabled={state.phase !== "solving"} onAttempt={submitAttempt} />
      )}
    </Panel>
  );
}
