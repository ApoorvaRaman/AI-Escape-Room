import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import kbData from "@/data/knowledge_base.json";
import type { KBEntry } from "./types";

/**
 * In-memory vector store over the static knowledge base.
 *  - Local vectors: deterministic hashed bag-of-words (always available, no network).
 *  - Remote vectors: OpenAI embeddings when OPENAI_API_KEY is set (hybrid-scored with local).
 * The store is cached on globalThis so hot reloads and warm lambdas reuse it.
 */

const DIM = 384;
const STOP = new Set(
  "a an the and or of to in on for with is are was were be been it its this that these those as at by from into than then so if not no do does did can could should would will you your we our they their there here which what when how why who whom about over under more most less".split(
    " "
  )
);

function stem(w: string): string {
  if (w.length > 5) return w.replace(/(ing|ed|es|s)$/, "");
  if (w.length > 4) return w.replace(/s$/, "");
  return w;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function localEmbed(text: string): number[] {
  const v = new Array<number>(DIM).fill(0);
  const toks = tokenize(text);
  for (let i = 0; i < toks.length; i++) {
    v[hash(toks[i]) % DIM] += 1;
    if (i < toks.length - 1) v[hash(toks[i] + "_" + toks[i + 1]) % DIM] += 0.5;
  }
  const norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0)) || 1;
  return v.map((x) => x / norm);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1);
}

export interface RetrievalHit {
  doc: KBEntry;
  score: number;
}

interface StoredItem {
  doc: KBEntry;
  local: number[];
  remote?: number[];
}

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

export class MemoryVectorStore {
  private items: StoredItem[] = [];
  private remoteReady = false;

  static async build(docs: KBEntry[]): Promise<MemoryVectorStore> {
    const store = new MemoryVectorStore();
    store.items = docs.map((doc) => ({ doc, local: localEmbed(`${doc.title}. ${doc.text}`) }));

    if (process.env.OPENAI_API_KEY) {
      try {
        const { embeddings } = await embedMany({
          model: openai.textEmbeddingModel(EMBEDDING_MODEL),
          values: docs.map((d) => `${d.title}. ${d.text}`),
        });
        embeddings.forEach((e, i) => (store.items[i].remote = e));
        store.remoteReady = true;
      } catch (err) {
        console.warn("[rag] remote embeddings unavailable, using local vectors:", (err as Error).message);
      }
    }
    return store;
  }

  get mode(): "hybrid" | "local" {
    return this.remoteReady ? "hybrid" : "local";
  }

  async search(query: string, k = 3, stageId?: number): Promise<RetrievalHit[]> {
    const qLocal = localEmbed(query);
    let qRemote: number[] | undefined;
    if (this.remoteReady) {
      try {
        const { embedding } = await embed({
          model: openai.textEmbeddingModel(EMBEDDING_MODEL),
          value: query,
        });
        qRemote = embedding;
      } catch {
        qRemote = undefined;
      }
    }

    const hits = this.items.map((it) => {
      const l = cosine(qLocal, it.local);
      let score = l;
      if (qRemote && it.remote) score = 0.7 * cosine(qRemote, it.remote) + 0.3 * l;
      if (stageId !== undefined && it.doc.stages.includes(stageId)) score += 0.15;
      return { doc: it.doc, score };
    });
    return hits.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

const g = globalThis as unknown as { __kbStore?: Promise<MemoryVectorStore> };

export function getKnowledgeStore(): Promise<MemoryVectorStore> {
  if (!g.__kbStore) g.__kbStore = MemoryVectorStore.build(kbData as KBEntry[]);
  return g.__kbStore;
}

export async function retrieve(query: string, k = 3, stageId?: number): Promise<RetrievalHit[]> {
  const store = await getKnowledgeStore();
  return store.search(query, k, stageId);
}
