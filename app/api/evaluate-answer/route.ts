import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateAnswer } from "@/lib/evaluator";

export const runtime = "nodejs";

const bodySchema = z.object({
  stageId: z.number().int().min(1).max(8),
  answer: z.string().max(3000),
  tier: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { is_correct: false, confidence: 0, feedback: "Invalid request." },
      { status: 400 }
    );
  }
  const { stageId, answer, tier } = parsed.data;
  const result = await evaluateAnswer(stageId, answer, tier);
  // Strict contract: { is_correct: boolean, confidence: number, feedback: string }
  return NextResponse.json({
    is_correct: result.is_correct,
    confidence: result.confidence,
    feedback: result.feedback,
  });
}
