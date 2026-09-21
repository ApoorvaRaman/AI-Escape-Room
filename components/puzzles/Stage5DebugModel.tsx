"use client";

import { useState } from "react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

const BUGGY = `import torch
import torch.nn as nn

class Classifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(28 * 28, 128)
        self.fc2 = nn.Linear(64, 10)

    def forward(self, x):
        x = self.flatten(x)
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = Classifier()
out = model(torch.randn(32, 28, 28))`;

const INITIAL_TRACE = `Traceback (most recent call last):
  File "train.py", line 18, in <module>
    out = model(torch.randn(32, 28, 28))
  File "train.py", line 15, in forward
    return self.fc2(x)
RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x128 and 64x10)`;

function runModel(code: string): { ok: boolean; output: string } {
  const fc1 = /self\.fc1\s*=\s*nn\.Linear\(\s*([^,()]+?)\s*,\s*(\d+)\s*\)/.exec(code);
  const fc2 = /self\.fc2\s*=\s*nn\.Linear\(\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(code);
  if (!fc1 || !fc2) {
    return { ok: false, output: "AttributeError: model must define self.fc1 and self.fc2 with nn.Linear(in, out)." };
  }
  const fc1In = fc1[1].replace(/\s/g, "");
  const fc1Out = Number(fc1[2]);
  const fc2In = Number(fc2[1]);
  const fc2Out = Number(fc2[2]);
  if (fc1In !== "784" && fc1In !== "28*28") {
    return { ok: false, output: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x784 and ${fc1In}x${fc1Out})` };
  }
  if (fc1Out !== fc2In) {
    return { ok: false, output: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (32x${fc1Out} and ${fc2In}x${fc2Out})` };
  }
  if (fc2Out !== 10) {
    return { ok: false, output: `Forward pass ran, but output shape is [32, ${fc2Out}]. The task needs 10 class logits.` };
  }
  return { ok: true, output: "Forward pass OK. Output shape: torch.Size([32, 10])" };
}

export default function Stage5DebugModel({ tier, disabled, onAttempt }: PuzzleProps) {
  const [code, setCode] = useState(BUGGY);
  const [output, setOutput] = useState<{ ok: boolean; text: string }>({ ok: false, text: INITIAL_TRACE });
  const [quick, setQuick] = useState("");

  const run = () => {
    const r = runModel(code);
    setOutput({ ok: r.ok, text: r.output });
    onAttempt(r.ok);
  };

  const submitQuick = () => {
    const ok = quick.trim() === "128";
    setOutput({ ok, text: ok ? "Quick fix accepted: fc2 takes 128 input features. Forward pass OK." : "That input size does not match fc1's output." });
    onAttempt(ok);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-slate-800 bg-slate-900 px-3 py-1.5">
          <span className="font-mono text-xs text-slate-400">train.py</span>
          <span className="font-mono text-xs text-cyan-400">python 3 · pytorch</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={disabled}
          spellCheck={false}
          rows={18}
          aria-label="Code editor"
          className="w-full resize-y rounded-b-lg border border-slate-800 bg-slate-950 p-3 font-mono text-sm leading-6 text-slate-200 outline-none focus:border-cyan-500/60"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={disabled}
          className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
        >
          Run forward pass
        </button>
        <button
          onClick={() => { setCode(BUGGY); }}
          disabled={disabled}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-40"
        >
          Reset code
        </button>
        {tier === "EASY" && (
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="quick" className="text-xs text-emerald-400">Quick fix: fc2 input size</label>
            <input
              id="quick" value={quick} onChange={(e) => setQuick(e.target.value)} inputMode="numeric"
              className="w-20 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-400"
            />
            <button onClick={submitQuick} disabled={!quick.trim() || disabled} className="rounded-md border border-emerald-500/50 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-40">
              Apply
            </button>
          </div>
        )}
      </div>

      <pre className={cn("whitespace-pre-wrap rounded-lg border p-3 font-mono text-xs leading-5", output.ok ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-300" : "border-rose-500/40 bg-rose-500/5 text-rose-300")}>
        {output.text}
      </pre>
    </div>
  );
}
