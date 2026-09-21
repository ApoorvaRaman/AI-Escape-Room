"use client";

import { useMemo, useState } from "react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLAINTEXT = "LAYER ONE WEIGHT KEY IS TENSOR";
const ANSWER = "TENSOR";

function caesar(text: string, k: number): string {
  return text.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode((((ch.charCodeAt(0) - base + k) % 26) + 26) % 26 + base);
  });
}

export default function Stage4Cryptography({ tier, disabled, onAttempt }: PuzzleProps) {
  // The cipher is fixed when the stage loads so a live tier change never re-encodes it mid-solve.
  const [secretShift] = useState(() => (tier === "EASY" ? 3 : tier === "MEDIUM" ? 5 : 11));
  const cipher = useMemo(() => btoa(caesar(PLAINTEXT, secretShift)), [secretShift]);

  const [layer1, setLayer1] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [shift, setShift] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const decodeBase64 = () => {
    try {
      setLayer1(atob(cipher));
      setDecodeError(null);
    } catch {
      setDecodeError("Invalid Base64 input.");
    }
  };

  const submit = () => {
    const ok = answer.trim().toUpperCase() === ANSWER;
    setFeedback(ok ? "Key accepted. Layer one weights unlocked." : "That key does not unlock the weights.");
    onAttempt(ok);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-4">
        <p className="font-mono text-xs text-cyan-400">INTERCEPTED TRANSMISSION</p>
        <p className="mt-2 break-all font-mono text-sm text-slate-200">{cipher}</p>
        {tier === "EASY" && <p className="mt-2 text-xs text-emerald-400">Clue: the Caesar shift is {secretShift}.</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-medium text-slate-300">Tool 1: Base64 decoder</p>
          <button
            onClick={decodeBase64}
            disabled={disabled}
            className="mt-3 rounded-md border border-cyan-500/50 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40"
          >
            Decode Base64
          </button>
          <p className="mt-3 min-h-[2.5rem] break-all font-mono text-sm text-slate-200">
            {decodeError ?? layer1 ?? <span className="text-slate-600">awaiting input</span>}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-medium text-slate-300">Tool 2: Caesar shift back by {shift}</p>
          <input
            type="range" min={0} max={25} value={shift}
            onChange={(e) => setShift(Number(e.target.value))}
            disabled={!layer1 || disabled}
            aria-label="Caesar shift"
            className="mt-3 w-full accent-cyan-400 disabled:opacity-40"
          />
          <p className="mt-2 min-h-[2.5rem] break-all font-mono text-sm text-emerald-300">
            {layer1 ? caesar(layer1, -shift) : <span className="text-slate-600">decode Base64 first</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300" htmlFor="key-input">Recovered weight key</label>
        <input
          id="key-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && answer.trim() && !disabled && submit()}
          disabled={disabled}
          placeholder="KEY"
          className="w-44 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm uppercase text-cyan-300 outline-none focus:border-cyan-400"
        />
        <button
          onClick={submit}
          disabled={!answer.trim() || disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unlock weights
        </button>
        {feedback && <p className={cn("text-sm", feedback.startsWith("Key accepted") ? "text-emerald-400" : "text-rose-500")}>{feedback}</p>}
      </div>
    </div>
  );
}
