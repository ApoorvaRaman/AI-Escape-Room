"use client";

import { Clock, Trophy, User } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { TOTAL_STAGES } from "@/lib/stages";
import { cn, fmtTime } from "@/lib/utils";

export default function Header({ onOpenLeaderboard }: { onOpenLeaderboard: () => void }) {
  const { state, score } = useGame();
  const urgent = state.timeLeft <= 120;
  const solved = state.results.length;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div
          role="timer"
          aria-label={`Time remaining ${fmtTime(state.timeLeft)}`}
          className={cn(
            "flex items-center gap-2 font-mono text-3xl font-bold tabular-nums",
            urgent ? "animate-alarm text-rose-500" : "text-cyan-400"
          )}
        >
          <Clock className="h-6 w-6" aria-hidden />
          {fmtTime(state.timeLeft)}
        </div>

        <div className="min-w-[200px] flex-1">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Stage {Math.min(state.stageIndex + 1, TOTAL_STAGES)} of {TOTAL_STAGES}</span>
            <span>{solved} cleared</span>
          </div>
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: TOTAL_STAGES }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full",
                  i < solved ? "bg-emerald-500" : i === state.stageIndex ? "bg-cyan-500 animate-glow" : "bg-slate-800"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <div className="text-right">
            <p className="text-xs text-slate-500">Score</p>
            <p className="font-mono text-xl font-semibold tabular-nums text-emerald-400">{score}</p>
          </div>
          <div className="hidden items-center gap-1.5 text-slate-300 sm:flex">
            <User className="h-4 w-4 text-slate-500" aria-hidden />
            <span className="font-mono text-xs">{state.playerId}</span>
          </div>
          <button
            onClick={onOpenLeaderboard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300"
          >
            <Trophy className="h-4 w-4" aria-hidden /> Leaderboard
          </button>
        </div>
      </div>
    </header>
  );
}
