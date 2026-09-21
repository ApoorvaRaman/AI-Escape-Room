import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/types";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md", className)}>{children}</section>;
}

const TIER_STYLES: Record<Tier, string> = {
  EASY: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  HARD: "border-rose-500/50 bg-rose-500/10 text-rose-400",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={cn("rounded-md border px-2 py-0.5 font-mono text-xs font-semibold", TIER_STYLES[tier])}>{tier}</span>
  );
}
