"use client";

import { useMemo, useState } from "react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = { id: string; age: number; heart_rate: number; risk_score: number; label: number };
type Col = keyof Row;
const COLS: Col[] = ["id", "age", "heart_rate", "risk_score", "label"];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRows(n: number): Row[] {
  const rnd = mulberry32(42);
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    const risk = Math.round((0.03 + rnd() * 0.92) * 100) / 100;
    rows.push({
      id: `R-${200 + i}`,
      age: 22 + Math.floor(rnd() * 60),
      heart_rate: 55 + Math.floor(rnd() * 50),
      risk_score: risk,
      label: risk > 0.5 ? 1 : 0,
    });
  }
  // valid-but-extreme decoys
  rows[3] = { ...rows[3], age: 91, risk_score: 0.99, label: 1 };
  rows[5] = { ...rows[5], heart_rate: 128 };
  if (n > 12) rows[11] = { ...rows[11], age: 19, risk_score: 0.01, label: 0 };
  // the corrupted record
  rows[7] = { ...rows[7], risk_score: 1.87, label: 1 };
  return rows;
}

export default function Stage2DataDetective({ tier, disabled, onAttempt }: PuzzleProps) {
  const n = tier === "EASY" ? 10 : tier === "MEDIUM" ? 16 : 26;
  const rows = useMemo(() => buildRows(n), [n]);
  const [view, setView] = useState<"grid" | "json">("grid");
  const [sel, setSel] = useState<{ id: string; col: Col } | null>(null);
  const [sort, setSort] = useState<{ col: Col; dir: 1 | -1 } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const x = a[sort.col], y = b[sort.col];
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [rows, sort]);

  const toggleSort = (col: Col) =>
    setSort((s) => (s && s.col === col ? (s.dir === 1 ? { col, dir: -1 } : null) : { col, dir: 1 }));

  const submit = () => {
    if (!sel) return;
    const row = rows.find((r) => r.id === sel.id)!;
    const val = row[sel.col];
    const ok = sel.col === "risk_score" && typeof val === "number" && (val < 0 || val > 1);
    setFeedback(ok ? `Confirmed: ${sel.id} holds an impossible probability.` : `${sel.id} / ${sel.col} = ${val} is unusual at most. It is not an impossible value.`);
    onAttempt(ok);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          Inference log from <span className="font-mono text-cyan-400">risk_model_v3</span> ({n} records). Click a column header to sort, click a cell to flag it.
        </p>
        <div className="flex rounded-lg border border-slate-800 p-0.5 text-xs">
          {(["grid", "json"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-md px-3 py-1 font-mono", view === v ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="max-h-80 overflow-auto rounded-lg border border-slate-800">
          <table className="w-full border-collapse font-mono text-sm">
            <thead className="sticky top-0 bg-slate-900">
              <tr>
                {COLS.map((c) => (
                  <th key={c} onClick={() => toggleSort(c)} className="cursor-pointer select-none border-b border-slate-800 px-3 py-2 text-left text-xs text-cyan-400 hover:bg-slate-800">
                    {c}{sort?.col === c ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="odd:bg-slate-900/40">
                  {COLS.map((c) => {
                    const active = sel?.id === r.id && sel.col === c;
                    return (
                      <td key={c}>
                        <button
                          disabled={disabled}
                          onClick={() => setSel({ id: r.id, col: c })}
                          className={cn("w-full px-3 py-1.5 text-left transition-colors", active ? "bg-rose-500/25 text-rose-300 outline outline-1 outline-rose-500" : "hover:bg-cyan-500/10")}
                        >
                          {String(r[c])}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950/70 p-3 font-mono text-xs text-slate-300">
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={submit}
          disabled={!sel || disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Report anomaly
        </button>
        <span className="font-mono text-xs text-slate-500">
          {sel ? `flagged: ${sel.id} / ${sel.col}` : "nothing flagged"}
        </span>
        {feedback && <p className={cn("text-sm", feedback.startsWith("Confirmed") ? "text-emerald-400" : "text-rose-500")}>{feedback}</p>}
      </div>
    </div>
  );
}
