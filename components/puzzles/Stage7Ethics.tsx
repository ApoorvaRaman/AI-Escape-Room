"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { EvaluationResult, PuzzleProps } from "@/lib/types";
import { TIER_CONFIG } from "@/lib/dda";
import { cn } from "@/lib/utils";

export default function Stage7Ethics({ tier, disabled, onAttempt }: PuzzleProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId: 7, answer, tier }),
      });
      if (!res.ok) throw new Error("Evaluator unavailable");
      const data = (await res.json()) as EvaluationResult;
      setResult(data);
      onAttempt(data.is_correct);
    } catch {
      setError("The evaluator could not be reached. Your attempt was not counted. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <article className="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-300">
        <h3 className="font-mono text-xs text-cyan-400">CASE FILE: HireRight AI</h3>
        <p className="mt-2">
          A large company deploys <strong className="text-slate-100">HireRight AI</strong> to shortlist job applicants. It was trained on ten years of past hiring decisions, during which the company hired mostly men.
        </p>
        <p className="mt-2">
          Auditors find the tool consistently ranks résumés lower when they mention a women&apos;s chess club or a women&apos;s college. The tool also pulls applicants&apos; public social media posts into their scores without telling them.
        </p>
        <p className="mt-2 text-slate-400">
          In your own words: what went wrong{tier === "HARD" ? ", why it happened, and how you would fix it" : tier === "MEDIUM" ? " and why (or how to fix it)" : ""}?
        </p>
      </article>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled || loading}
        rows={6}
        maxLength={1500}
        placeholder="Write your analysis. Meaning is graded, not keywords."
        aria-label="Your ethical analysis"
        className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 outline-none focus:border-cyan-400"
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={submit}
          disabled={answer.trim().length < 10 || disabled || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit analysis
        </button>
        <span className="text-xs text-slate-500">
          Needs confidence ≥ {Math.round(TIER_CONFIG[tier].confidenceThreshold * 100)}% at {tier} difficulty
        </span>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      {result && (
        <div className={cn("rounded-lg border p-3", result.is_correct ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5")}>
          <div className="flex items-center justify-between text-xs">
            <span className={result.is_correct ? "text-emerald-400" : "text-rose-400"}>{result.is_correct ? "Accepted" : "Not accepted"}</span>
            <span className="font-mono text-slate-400">confidence {Math.round(result.confidence * 100)}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className={cn("h-full", result.is_correct ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${Math.round(result.confidence * 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-slate-300">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
