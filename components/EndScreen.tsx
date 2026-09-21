"use client";

import { DoorOpen, Lock } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { fmtTime } from "@/lib/utils";

export default function EndScreen({ onOpenLeaderboard }: { onOpenLeaderboard: () => void }) {
  const { state, score, reset } = useGame();
  const won = state.status === "won";
  const b = state.breakdown;

  const rows: [string, number, string][] = [
    ["Correctness points", b.correctness, "text-emerald-400"],
    ["Speed bonus", b.speed, "text-emerald-400"],
    ["Escape completion bonus", b.bonus, "text-emerald-400"],
    ["Hint penalties", -b.hintPenalty, "text-rose-400"],
    ["Wrong attempt penalties", -b.wrongPenalty, "text-rose-400"],
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-md">
        <div className={won ? "text-emerald-400" : "text-rose-500"}>
          {won ? <DoorOpen className="h-10 w-10" aria-hidden /> : <Lock className="h-10 w-10" aria-hidden />}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-50">{won ? "You escaped" : "Time ran out"}</h1>
        <p className="mt-2 text-slate-400">
          {won
            ? `${state.playerId} cleared all 8 stages in ${fmtTime(state.totalTime - state.timeLeft)}.`
            : `${state.playerId} cleared ${state.results.length} of 8 stages before the lab sealed.`}
        </p>

        <dl className="mt-6 divide-y divide-slate-800 font-mono text-sm">
          {rows.map(([label, val, color]) => (
            <div key={label} className="flex justify-between py-2">
              <dt className="font-sans text-slate-400">{label}</dt>
              <dd className={color}>{val >= 0 ? `+${val}` : val}</dd>
            </div>
          ))}
          <div className="flex justify-between py-3 text-lg">
            <dt className="font-sans font-semibold text-slate-200">Final score</dt>
            <dd className="font-bold text-cyan-400">{score}</dd>
          </div>
        </dl>

        <p className="mt-2 text-xs text-slate-500">
          {state.totalWrong} wrong attempts · {state.totalHints} hints used · run submitted to the leaderboard
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="flex-1 rounded-lg bg-cyan-500 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400">Play again</button>
          <button onClick={onOpenLeaderboard} className="rounded-lg border border-slate-700 px-5 text-sm text-slate-300 hover:border-cyan-500/50">View leaderboard</button>
        </div>
      </div>
    </main>
  );
}
