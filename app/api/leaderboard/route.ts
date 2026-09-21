import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import type { LeaderboardEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), ".data", "leaderboard.json");
const g = globalThis as unknown as { __lb?: LeaderboardEntry[] };

const SEED: LeaderboardEntry[] = [
  { id: "seed-1", playerId: "CIPHER-0007", score: 1350, escaped: true, stagesCleared: 8, timeUsed: 512, wrong: 2, hints: 1, createdAt: 1 },
  { id: "seed-2", playerId: "LOGIC-4242", score: 1120, escaped: true, stagesCleared: 8, timeUsed: 641, wrong: 4, hints: 3, createdAt: 2 },
  { id: "seed-3", playerId: "VECTOR-9001", score: 830, escaped: false, stagesCleared: 6, timeUsed: 900, wrong: 5, hints: 2, createdAt: 3 },
  { id: "seed-4", playerId: "PIXEL-1337", score: 540, escaped: false, stagesCleared: 4, timeUsed: 900, wrong: 3, hints: 4, createdAt: 4 },
];

async function load(): Promise<LeaderboardEntry[]> {
  if (g.__lb) return g.__lb;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    g.__lb = JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    g.__lb = [...SEED];
  }
  return g.__lb;
}

async function persist(entries: LeaderboardEntry[]) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(entries), "utf8");
  } catch {
    /* read-only filesystems (serverless) fall back to memory only */
  }
}

function rank(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) => Number(b.escaped) - Number(a.escaped) || b.score - a.score || a.timeUsed - b.timeUsed
  );
}

const entrySchema = z.object({
  playerId: z.string().min(1).max(24),
  score: z.number().int().min(0).max(5000),
  escaped: z.boolean(),
  stagesCleared: z.number().int().min(0).max(8),
  timeUsed: z.number().int().min(0).max(3600),
  wrong: z.number().int().min(0).max(999),
  hints: z.number().int().min(0).max(999),
});

export async function GET() {
  const entries = await load();
  return NextResponse.json({ entries: rank(entries).slice(0, 20) });
}

export async function POST(req: Request) {
  const parsed = entrySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  const entries = await load();
  const entry: LeaderboardEntry = {
    ...parsed.data,
    playerId: parsed.data.playerId.replace(/[^\w\- ]/g, "").slice(0, 24) || "ANON",
    id: Math.random().toString(36).slice(2, 10),
    createdAt: Date.now(),
  };
  entries.push(entry);
  g.__lb = rank(entries).slice(0, 200);
  await persist(g.__lb);
  return NextResponse.json({ ok: true, entry });
}
