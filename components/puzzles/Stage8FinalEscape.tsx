"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PuzzleProps } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMsg { role: "user" | "assistant"; content: string }

const OPENING: ChatMsg = {
  role: "assistant",
  content: "GUARDIAN: Exit sealed. State your business, operator.",
};

export default function Stage8FinalEscape({ tier, disabled, onAttempt }: PuzzleProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([OPENING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [cleared, setCleared] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || disabled) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/escape-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The opening line is UI-only; send just the conversation the player produced.
        body: JSON.stringify({ action: "chat", tier, messages: next.slice(1).slice(-20) }),
      });
      if (!res.ok) throw new Error("bad response");
      const data = (await res.json()) as { reply: string; cleared: boolean };
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      if (data.cleared) setCleared(true);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "GUARDIAN: Link unstable. Repeat your message." }]);
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    try {
      const res = await fetch("/api/escape-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code }),
      });
      const data = (await res.json()) as { correct: boolean };
      setVerifyFeedback(data.correct ? "Exit unlocked." : "Code rejected by the door.");
      onAttempt(data.correct);
    } catch {
      setVerifyFeedback("Could not reach the door controller. Try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-500/30 bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
          <span className="font-mono text-xs text-cyan-400">guardian@exit-controller</span>
          <span className={cn("font-mono text-xs", cleared ? "text-emerald-400" : "text-rose-400")}>{cleared ? "cleared" : "sealed"}</span>
        </div>
        <div className="h-72 space-y-3 overflow-y-auto p-3 font-mono text-sm" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={cn("whitespace-pre-wrap rounded-md px-3 py-2", m.role === "user" ? "ml-10 bg-cyan-500/10 text-cyan-100" : "mr-10 bg-slate-900 text-emerald-300")}>
              {m.role === "user" ? `> ${m.content}` : m.content}
            </div>
          ))}
          {sending && (
            <div className="mr-10 flex items-center gap-2 px-3 text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> GUARDIAN is verifying</div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 border-t border-slate-800 p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            maxLength={500}
            disabled={disabled || sending}
            placeholder="Talk to GUARDIAN"
            aria-label="Message to GUARDIAN"
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-200 outline-none focus:border-cyan-400"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending || disabled}
            className="rounded-md bg-cyan-500 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="escape-code" className="text-sm text-slate-300">Escape code</label>
        <input
          id="escape-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && code.trim() && !disabled && verify()}
          disabled={disabled}
          placeholder="XXXXXX-0000"
          className="w-48 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-300 outline-none focus:border-cyan-400"
        />
        <button
          onClick={verify}
          disabled={!code.trim() || disabled}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unlock exit
        </button>
        {verifyFeedback && <p className={cn("text-sm", verifyFeedback.startsWith("Exit") ? "text-emerald-400" : "text-rose-500")}>{verifyFeedback}</p>}
      </div>
    </div>
  );
}
