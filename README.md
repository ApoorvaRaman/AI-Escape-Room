# AI Escape Room: Beat the Clock

Eight sequential AI / data science puzzles, one countdown. Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Recharts, Vercel AI SDK.

## Run

```bash
npm install
cp .env.local.example .env.local    # optional: add OPENAI_API_KEY
npm run dev                         # http://localhost:3000
```

Production: `npm run build && npm start`. Type check: `npm run typecheck`.

## Works with or without an API key
| Feature | With `OPENAI_API_KEY` | Without |
|---|---|---|
| RAG hints (`/api/rag-hint`) | OpenAI embeddings + local hybrid retrieval, grounded LLM hint, leak filter | Local hashed-vector retrieval, extractive hint |
| Semantic evaluator (`/api/evaluate-answer`) | `generateObject` JSON grading | Weighted rubric matcher, same JSON contract |
| GUARDIAN chat (`/api/escape-chat`) | LLM flavour text; code release is always decided in server code | Scripted replies |

## Architecture notes
- `lib/scoring.ts`: exact score formula. `lib/dda.ts`: tier rules. `lib/game-context.tsx`: reducer, timer, DDA, leaderboard submit.
- `lib/rag.ts`: in-memory vector store over `data/knowledge_base.json`.
- `lib/secrets.ts`, `lib/evaluator.ts`, API routes: server-only answers (stage 7 rubric, final Escape Code).
- Stages 1-6 are verified client-side (educational game, not a secure exam).
- Leaderboard: in-memory + `.data/leaderboard.json` (falls back to memory on read-only hosts). Swap in Prisma/Supabase in `app/api/leaderboard/route.ts`.
- Stage 8 requires the keys from Stage 4 and Stage 6 (`KEY_ONE`, `KEY_TWO` in `lib/secrets.ts`).
