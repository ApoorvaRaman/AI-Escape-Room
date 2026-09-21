"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

const DATA = [
  { epoch: 1, train: 2.1, val: 2.15, acc: 41 },
  { epoch: 2, train: 1.55, val: 1.62, acc: 55 },
  { epoch: 3, train: 1.18, val: 1.3, acc: 64 },
  { epoch: 4, train: 0.92, val: 1.1, acc: 70 },
  { epoch: 5, train: 0.71, val: 0.98, acc: 74 },
  { epoch: 6, train: 0.55, val: 0.93, acc: 76 },
  { epoch: 7, train: 0.42, val: 0.97, acc: 75 },
  { epoch: 8, train: 0.31, val: 1.05, acc: 73 },
  { epoch: 9, train: 0.22, val: 1.18, acc: 70 },
  { epoch: 10, train: 0.15, val: 1.32, acc: 67 },
];

/** Code = [epoch of lowest val loss][first epoch where val - train > 0.5][peak val accuracy] */
function deriveCode(): string {
  const minVal = DATA.reduce((a, b) => (b.val < a.val ? b : a)).epoch;
  const gapEpoch = DATA.find((d) => d.val - d.train > 0.5)!.epoch;
  const peak = Math.max(...DATA.map((d) => d.acc));
  return `${minVal}${gapEpoch}${peak}`;
}
const CODE = deriveCode();

export default function Stage6DataViz({ tier, disabled, onAttempt }: PuzzleProps) {
  const [show, setShow] = useState({ train: true, val: true });
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const minEpoch = DATA.reduce((a, b) => (b.val < a.val ? b : a)).epoch;

  const submit = () => {
    const ok = input.trim() === CODE;
    setFeedback(ok ? "Keypad accepted. The door unlocks." : "Keypad rejected. Recheck each digit group against the charts.");
    onAttempt(ok);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/70 p-4 text-sm leading-relaxed">
        <p className="font-mono text-xs text-cyan-400">KEYPAD RULES</p>
        {tier === "EASY" || tier === "MEDIUM" ? (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-300">
            <li>Epoch with the lowest validation loss (one digit).</li>
            <li>First epoch where validation loss exceeds training loss by more than 0.5 (one digit).</li>
            <li>Peak validation accuracy, in percent (two digits).</li>
          </ol>
        ) : (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-300">
            <li>The moment the model generalized best.</li>
            <li>The first moment memorization became dramatic: the two curves parted by more than half a unit.</li>
            <li>The highest score the model ever earned on unseen data.</li>
          </ol>
        )}
        <p className="mt-2 text-xs text-slate-500">Write the groups in order, with no separators. The code has four digits.</p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">Loss per epoch</p>
          <div className="flex gap-2 text-xs">
            {(["train", "val"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                className={cn("rounded-md border px-2 py-1 font-mono", show[k] ? "border-cyan-500/60 text-cyan-300" : "border-slate-700 text-slate-500")}
              >
                {k === "train" ? "training" : "validation"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 2.4]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelFormatter={(l) => `Epoch ${l}`} />
              <Legend />
              {show.train && <Line type="monotone" dataKey="train" name="training loss" stroke="#39FF14" strokeWidth={2} dot={{ r: 3 }} />}
              {show.val && <Line type="monotone" dataKey="val" name="validation loss" stroke="#00F0FF" strokeWidth={2} dot={{ r: 3 }} />}
              {tier === "EASY" && <ReferenceLine x={minEpoch} stroke="#FF3131" strokeDasharray="4 4" label={{ value: "min val", fill: "#FF3131", fontSize: 11 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <p className="mb-2 text-sm font-medium text-slate-300">Validation accuracy (%) per epoch</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} labelFormatter={(l) => `Epoch ${l}`} cursor={{ fill: "rgba(0,240,255,0.08)" }} />
              <Bar dataKey="acc" name="val accuracy" fill="#00F0FF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="code-input" className="text-sm text-slate-300">Unlock code</label>
        <input
          id="code-input" value={input} maxLength={4} inputMode="numeric"
          onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && input.length === 4 && !disabled && submit()}
          disabled={disabled} placeholder="0000"
          className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-center font-mono text-lg tracking-[0.3em] text-cyan-300 outline-none focus:border-cyan-400"
        />
        <button
          onClick={submit} disabled={input.length !== 4 || disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enter code
        </button>
        {feedback && <p className={cn("text-sm", feedback.startsWith("Keypad accepted") ? "text-emerald-400" : "text-rose-500")}>{feedback}</p>}
      </div>
    </div>
  );
}
