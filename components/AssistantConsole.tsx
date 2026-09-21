"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { TIER_CONFIG } from "@/lib/dda";
import { cn } from "@/lib/utils";
import { Panel, TierBadge } from "./ui";

const KIND_STYLES: Record<string, string> = {
  hint: "border-cyan-500/30 bg-cyan-500/5 text-slate-200",
  auto: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
  info: "border-slate-700 bg-slate-800/50 text-slate-300",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  error: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  question: "border-slate-700 bg-slate-950 text-slate-300",
};

export default function AssistantConsole() {
  const { state, stage, requestHint, hintLoading, nextHintPenalty } = useGame();
  const [q, setQ] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const cfg = TIER_CONFIG[state.tier];
  const canAsk = state.phase === "solving" && !hintLoading;
  const stageMessages = state.messages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stageMessages.length]);

  const ask = () => {
    if (!canAsk) return;
    const text = q;
    setQ("");
    void requestHint(text);
  };

  const tierIndex = state.tier === "EASY" ? 0 : state.tier === "MEDIUM" ? 1 : 2;

  return (
    <Panel className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-cyan-400" aria-hidden />
        <h2 className="text-sm font-semibold text-slate-100">Lab Assistant</h2>
        <span className="ml-auto font-mono text-xs text-slate-500">RAG-grounded</span>
      </div>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Adaptive difficulty</p>
          <TierBadge tier={state.tier} />
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= tierIndex ? (tierIndex === 0 ? "bg-emerald-500" : tierIndex === 1 ? "bg-cyan-500" : "bg-rose-500") : "bg-slate-800")} />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{cfg.description}</p>
        <dl className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs">
          <div><dt className="text-slate-600">on stage</dt><dd className="text-slate-300">{state.stageElapsed}s</dd></div>
          <div><dt className="text-slate-600">wrong</dt><dd className={state.wrongInStage >= 3 ? "text-rose-400" : "text-slate-300"}>{state.wrongInStage}</dd></div>
          <div><dt className="text-slate-600">hints</dt><dd className="text-slate-300">{state.hintsInStage}</dd></div>
        </dl>
      </div>

      <div className="mt-3 min-h-[220px] flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-[420px]" aria-live="polite">
        {stageMessages.map((m) => (
          <div key={m.id} className={cn("rounded-lg border px-3 py-2 text-sm leading-relaxed", KIND_STYLES[m.kind], m.role === "user" && "ml-6")}>
            {m.kind === "auto" && <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden />}
            <span className="whitespace-pre-wrap">{m.content}</span>
            {m.sources && m.sources.length > 0 && (
              <p className="mt-2 border-t border-slate-800 pt-1.5 font-mono text-[11px] text-slate-500">sources: {m.sources.join(" · ")}</p>
            )}
          </div>
        ))}
        {hintLoading && (
          <div className="flex items-center gap-2 px-1 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Retrieving context</div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <input
            value={q} onChange={(e) => setQ(e.target.value)} maxLength={300}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            disabled={!canAsk}
            placeholder={`Ask about ${stage.title}`}
            aria-label="Ask the lab assistant"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
          />
          <button onClick={ask} disabled={!canAsk} aria-label="Send question" className="rounded-lg border border-cyan-500/50 px-3 text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={ask} disabled={!canAsk}
          className="w-full rounded-lg bg-cyan-500 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {q.trim() ? "Ask with hint" : "Request hint"} (-{nextHintPenalty} pts)
        </button>
      </div>
    </Panel>
  );
}
