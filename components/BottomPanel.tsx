"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronUp, RefreshCw, X } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { finalScore } from "@/lib/scoring";
import { STAGES } from "@/lib/stages";
import type { LeaderboardEntry } from "@/lib/types";
import { cn, fmtTime } from "@/lib/utils";

type Tab = "summary" | "leaderboard";

export default function BottomPanel({ open, onOpenChange, initialTab = "summary" }: { open: boolean; onOpenChange: (o: boolean) => void; initialTab?: Tab }) {
  const { state, score } = useGame();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (res.ok) setEntries(((await res.json()) as { entries: LeaderboardEntry[] }).entries);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time: poll every 5s while the leaderboard tab is visible.
  useEffect(() => {
    if (!open || tab !== "leaderboard") return;
    void load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [open, tab, load]);

  const live = state.status === "playing"
    ? { playerId: state.playerId, score, stagesCleared: state.results.length, timeUsed: state.totalTime - state.timeLeft }
    : null;

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={cn("rounded-md px-3 py-1.5 text-sm", tab === t ? "bg-cyan-500/15 text-cyan-300" : "text-slate-400 hover:text-slate-200")}
    >
      {label}
    </button>
  );

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md transition-transform duration-300", open ? "translate-y-0" : "translate-y-[calc(100%-2.75rem)]")}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-11 items-center gap-2">
          <button onClick={() => onOpenChange(!open)} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300" aria-expanded={open}>
            <ChevronUp className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
            Stage summary and leaderboard
          </button>
          <span className="ml-auto font-mono text-xs text-slate-500">
            {state.status === "playing" ? `${state.results.length}/8 cleared · ${score} pts` : ""}
          </span>
          {open && (
            <button onClick={() => onOpenChange(false)} aria-label="Close panel" className="text-slate-500 hover:text-slate-200"><X className="h-4 w-4" /></button>
          )}
        </div>

        <div className="pb-4">
          <div className="mb-3 flex gap-1">{tabBtn("summary", "Stage summary")}{tabBtn("leaderboard", "Leaderboard")}</div>

          <div className="max-h-64 overflow-auto rounded-lg border border-slate-800">
            {tab === "summary" ? (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-900 text-xs text-slate-400">
                  <tr><th className="px-3 py-2">Stage</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Wrong</th><th className="px-3 py-2">Hints</th><th className="px-3 py-2 text-right">Points</th></tr>
                </thead>
                <tbody className="font-mono">
                  {STAGES.map((s, i) => {
                    const r = state.results.find((x) => x.stageId === s.id);
                    const current = state.status === "playing" && i === state.stageIndex && !r;
                    const pts = r ? r.base + r.speed + r.bonus - r.hintPenalty - r.wrongPenalty : null;
                    return (
                      <tr key={s.id} className={cn("border-t border-slate-800", current && "bg-cyan-500/5")}>
                        <td className="px-3 py-1.5 font-sans text-slate-300">{s.id}. {s.title}</td>
                        <td className="px-3 py-1.5">{r ? `${r.timeSpent}s` : current ? `${state.stageElapsed}s` : "-"}</td>
                        <td className="px-3 py-1.5">{r ? r.wrong : current ? state.wrongInStage : "-"}</td>
                        <td className="px-3 py-1.5">{r ? r.hints : current ? state.hintsInStage : "-"}</td>
                        <td className={cn("px-3 py-1.5 text-right", pts !== null && pts >= 0 ? "text-emerald-400" : "text-slate-600")}>{pts !== null ? pts : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-slate-700 bg-slate-900/60 font-mono text-sm">
                  <tr>
                    <td className="px-3 py-2 font-sans text-slate-300" colSpan={4}>Total (clamped at 0)</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{finalScore(state.breakdown)}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 text-xs text-slate-500">
                  <span>Top runs · refreshes every 5s</span>
                  <button onClick={() => void load()} aria-label="Refresh leaderboard" className="hover:text-cyan-300"><RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /></button>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400">
                    <tr><th className="px-3 py-1.5">#</th><th className="px-3 py-1.5">Player</th><th className="px-3 py-1.5">Status</th><th className="px-3 py-1.5">Stages</th><th className="px-3 py-1.5">Time</th><th className="px-3 py-1.5 text-right">Score</th></tr>
                  </thead>
                  <tbody className="font-mono">
                    {live && (
                      <tr className="border-t border-slate-800 bg-cyan-500/10 text-cyan-200">
                        <td className="px-3 py-1.5">live</td><td className="px-3 py-1.5">{live.playerId}</td><td className="px-3 py-1.5">in progress</td><td className="px-3 py-1.5">{live.stagesCleared}/8</td><td className="px-3 py-1.5">{fmtTime(live.timeUsed)}</td><td className="px-3 py-1.5 text-right">{live.score}</td>
                      </tr>
                    )}
                    {entries.map((e, i) => (
                      <tr key={e.id} className={cn("border-t border-slate-800", e.playerId === state.playerId && "text-cyan-300")}>
                        <td className="px-3 py-1.5 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-1.5">{e.playerId}</td>
                        <td className={cn("px-3 py-1.5", e.escaped ? "text-emerald-400" : "text-slate-500")}>{e.escaped ? "escaped" : "sealed in"}</td>
                        <td className="px-3 py-1.5">{e.stagesCleared}/8</td>
                        <td className="px-3 py-1.5">{fmtTime(e.timeUsed)}</td>
                        <td className="px-3 py-1.5 text-right text-emerald-400">{e.score}</td>
                      </tr>
                    ))}
                    {entries.length === 0 && !loading && (
                      <tr><td colSpan={6} className="px-3 py-4 text-center font-sans text-slate-500">No runs recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
