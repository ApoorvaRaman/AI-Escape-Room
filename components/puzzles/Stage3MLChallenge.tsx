"use client";

import { useMemo, useState } from "react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALGOS = ["Random Forest", "CNN", "DBSCAN", "Linear Regression", "K-Means"] as const;

interface Scenario {
  id: string;
  text: string;
  answer: (typeof ALGOS)[number];
  easyOptions: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    text: "20,000 labeled customer records with 40 mixed numeric and categorical columns. Goal: predict churn and rank which features matter most.",
    answer: "Random Forest",
    easyOptions: ["Random Forest", "DBSCAN", "CNN"],
  },
  {
    id: "s2",
    text: "100,000 labeled photos of circuit boards. Goal: detect which boards contain a soldering defect.",
    answer: "CNN",
    easyOptions: ["CNN", "Linear Regression", "K-Means"],
  },
  {
    id: "s3",
    text: "Unlabeled GPS pings from delivery vehicles. Clusters are irregular in shape, the count is unknown, and stray pings must be flagged as noise.",
    answer: "DBSCAN",
    easyOptions: ["K-Means", "DBSCAN", "Random Forest"],
  },
  {
    id: "s4",
    text: "Five numeric features describing a house. Goal: predict its sale price as a number, with coefficients a client can read and interpret.",
    answer: "Linear Regression",
    easyOptions: ["Linear Regression", "CNN", "DBSCAN"],
  },
];

export default function Stage3MLChallenge({ tier, disabled, onAttempt }: PuzzleProps) {
  const scenarios = useMemo(() => (tier === "HARD" ? SCENARIOS : SCENARIOS.slice(0, 3)), [tier]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [marks, setMarks] = useState<Record<string, boolean> | null>(null);

  const complete = scenarios.every((s) => picks[s.id]);

  const submit = () => {
    const result: Record<string, boolean> = {};
    scenarios.forEach((s) => (result[s.id] = picks[s.id] === s.answer));
    setMarks(result);
    onAttempt(Object.values(result).every(Boolean));
  };

  return (
    <div className="space-y-4">
      {scenarios.map((s, i) => {
        const options = tier === "EASY" ? s.easyOptions : [...ALGOS];
        return (
          <div
            key={s.id}
            className={cn(
              "rounded-lg border p-4",
              marks ? (marks[s.id] ? "border-emerald-500/50 bg-emerald-500/5" : "border-rose-500/50 bg-rose-500/5") : "border-slate-800 bg-slate-900/60"
            )}
          >
            <p className="text-sm text-slate-300"><span className="font-mono text-cyan-400">Report {i + 1}.</span> {s.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((o) => (
                <button
                  key={o}
                  disabled={disabled}
                  onClick={() => { setPicks((p) => ({ ...p, [s.id]: o })); setMarks(null); }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    picks[s.id] === o ? "border-cyan-400 bg-cyan-500 text-slate-950" : "border-slate-700 text-slate-300 hover:border-cyan-500/60"
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4">
        <button
          onClick={submit}
          disabled={!complete || disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Commit selections
        </button>
        {marks && (
          <p className={cn("text-sm", Object.values(marks).every(Boolean) ? "text-emerald-400" : "text-rose-500")}>
            {Object.values(marks).every(Boolean)
              ? "All algorithms matched."
              : `${Object.values(marks).filter(Boolean).length} of ${scenarios.length} correct. Revisit the highlighted reports.`}
          </p>
        )}
      </div>
    </div>
  );
}
