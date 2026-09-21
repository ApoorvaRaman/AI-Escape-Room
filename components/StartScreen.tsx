"use client";

import { useEffect, useState } from "react";
import { STAGES } from "@/lib/stages";
import { useGame } from "@/lib/game-context";
import { randomPlayerId, cn } from "@/lib/utils";

export default function StartScreen({ onOpenLeaderboard }: { onOpenLeaderboard: () => void }) {
  const { start } = useGame();
  const [playerId, setPlayerId] = useState("");
  const [minutes, setMinutes] = useState(12);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("escape-room:player"); } catch { /* storage unavailable */ }
    setPlayerId(saved || randomPlayerId());
  }, []);

  const begin = () => {
    const id = playerId.trim().replace(/[^\w\- ]/g, "").slice(0, 24) || randomPlayerId();
    try { localStorage.setItem("escape-room:player", id); } catch { /* ignore */ }
    start(id, minutes * 60);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-4 py-12 lg:flex-row lg:items-center">
      <div className="flex-1">
        <p className="font-mono text-sm text-cyan-400">virtual-ai-lab // sector 7</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">AI Escape Room</h1>
        <p className="mt-2 text-2xl font-semibold text-cyan-400">Beat the Clock</p>
        <p className="mt-5 max-w-md leading-relaxed text-slate-400">
          The lab has locked down. Solve eight AI and data science puzzles in order before the countdown ends. The room adapts to how you play, and the lab assistant can hint, at a price.
        </p>

        <div className="mt-8 max-w-md space-y-5 rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div>
            <label htmlFor="pid" className="text-sm font-medium text-slate-300">Player ID</label>
            <input
              id="pid" value={playerId} onChange={(e) => setPlayerId(e.target.value)} maxLength={24}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Time limit</p>
            <div className="mt-1.5 flex gap-2">
              {[10, 12, 15].map((m) => (
                <button
                  key={m} onClick={() => setMinutes(m)}
                  className={cn("flex-1 rounded-lg border py-2 text-sm font-medium", minutes === m ? "border-cyan-400 bg-cyan-500 text-slate-950" : "border-slate-700 text-slate-300 hover:border-cyan-500/50")}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={begin} className="flex-1 rounded-lg bg-cyan-500 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400">
              Start the countdown
            </button>
            <button onClick={onOpenLeaderboard} className="rounded-lg border border-slate-700 px-4 text-sm text-slate-300 hover:border-cyan-500/50">
              Leaderboard
            </button>
          </div>
        </div>

        <ul className="mt-6 max-w-md space-y-1 text-xs text-slate-500">
          <li>+100 per stage, up to +50 speed bonus, +200 for escaping.</li>
          <li>Hints cost 10, then 20, then 30 per stage. Wrong answers cost 5.</li>
          <li>The clock pauses between stages.</li>
        </ul>
      </div>

      <ol className="flex-1 space-y-2 lg:max-w-sm">
        {STAGES.map((s) => (
          <li key={s.id} className="flex items-baseline gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2.5">
            <span className="font-mono text-sm text-cyan-400">{s.id}</span>
            <div>
              <p className="text-sm font-medium text-slate-200">{s.title}</p>
              <p className="text-xs text-slate-500">{s.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
