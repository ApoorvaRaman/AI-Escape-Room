"use client";

import { useMemo, useState } from "react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Option { id: string; text: string; correct?: boolean }

const BASE_OPTIONS: Option[] = [
  { id: "a", text: "Atlas is overfit, because its validation accuracy is far below its training accuracy." },
  { id: "b", text: "Borealis is not overfit.", correct: true },
  { id: "c", text: "Borealis is underfit." },
  { id: "d", text: "Atlas will generalize well to unseen data." },
];
const HARD_EXTRA: Option = { id: "e", text: "Borealis must have been trained on more data than Atlas." };

export default function Stage1Logic({ tier, disabled, onAttempt }: PuzzleProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const options = useMemo(() => {
    if (tier === "HARD") return [BASE_OPTIONS[2], HARD_EXTRA, BASE_OPTIONS[0], BASE_OPTIONS[3], BASE_OPTIONS[1]];
    return BASE_OPTIONS;
  }, [tier]);

  const submit = () => {
    const opt = options.find((o) => o.id === selected);
    if (!opt) return;
    const ok = !!opt.correct;
    setFeedback(ok ? "Inference validated. The lock disengages." : "Inference rejected. That conclusion is not entailed by the premises.");
    onAttempt(ok);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-4 font-mono text-sm leading-relaxed">
        <p className="text-cyan-400">PREMISES</p>
        <p className="mt-2"><span className="text-slate-500">P1</span> If a model is overfit, then its validation accuracy is far below its training accuracy.</p>
        <p className="mt-1"><span className="text-slate-500">P2</span> Atlas: validation accuracy is far below its training accuracy.</p>
        <p className="mt-1"><span className="text-slate-500">P3</span> Borealis: validation accuracy is NOT far below its training accuracy.</p>
      </div>

      <fieldset className="space-y-2" disabled={disabled}>
        <legend className="mb-2 text-sm font-medium text-slate-300">Which single inference is logically valid?</legend>
        {options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
              selected === o.id ? "border-cyan-400 bg-cyan-500/10" : "border-slate-800 bg-slate-900/60 hover:border-cyan-500/40"
            )}
          >
            <input type="radio" name="inference" className="mt-1 accent-cyan-400" checked={selected === o.id} onChange={() => setSelected(o.id)} />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          onClick={submit}
          disabled={!selected || disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit inference
        </button>
        {feedback && <p className={cn("text-sm", feedback.startsWith("Inference validated") ? "text-emerald-400" : "text-rose-500")}>{feedback}</p>}
      </div>
    </div>
  );
}
