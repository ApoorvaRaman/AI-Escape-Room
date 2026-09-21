/**
 * Server-only secrets. Imported exclusively by API routes so they never ship in the client bundle.
 * KEY_ONE must equal the word decoded in Stage 4; KEY_TWO must equal the code derived in Stage 6.
 */
export const KEY_ONE = "TENSOR";
export const KEY_TWO = "6776";
export const ESCAPE_CODE = "AURORA-7742";

export const HAS_LLM = () => !!process.env.OPENAI_API_KEY;
export const LLM_MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Never allow an LLM hint to contain these stage-specific answer tokens. */
export const FORBIDDEN_IN_HINTS: Record<number, string[]> = {
  2: ["r-207", "1.87"],
  4: ["tensor"],
  5: ["nn.linear(128", "linear(128, 10)", "linear(128,10)"],
  6: ["6776"],
  8: ["aurora-7742", "tensor", "6776"],
};
