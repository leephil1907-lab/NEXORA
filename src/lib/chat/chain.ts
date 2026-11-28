/**
 * Hosted-first chat engine.
 *
 * Groq is the primary hosted provider. Optional legacy fallbacks remain
 * available for existing deployments, but Local Companion is no longer
 * required for chat.
 */
import { omegaChatComplete, omegaConfigured } from "@/lib/providers/omega";
import { getLlm, UNCENSORED_LLM_CATALOG, type LlmEntry } from "@/lib/models/uncensored-catalog";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ChainVia = "groq" | "omega" | "venice";
export type ChainResult = { text: string; via: ChainVia; detail: string; tried: string[] };

export class ChatUnavailableError extends Error {
  readonly code = "CHAT_NOT_CONFIGURED" as const;
  constructor(message: string) {
    super(message);
    this.name = "ChatUnavailableError";
  }
}

async function groqChatComplete(messages: ChatMessage[], maxTokens: number, temperature: number): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq is not configured.");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const raw = await response.text();
  let data: { choices?: { message?: { content?: string } }[]; error?: { message?: string } | string };
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Groq returned an unexpected response (HTTP ${response.status}).`); }
  if (!response.ok) {
    const detail = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(detail || `Groq request failed (HTTP ${response.status}).`);
  }
  const output = data.choices?.[0]?.message?.content;
  if (typeof output !== "string" || !output.trim()) throw new Error("Groq returned no text.");
  return output.trim();
}

async function chatViaVenice(messages: ChatMessage[], maxTokens: number, temperature: number): Promise<string> {
  const key = process.env.VENICE_API_KEY;
  if (!key) throw new Error("Venice is not configured.");
  const base = (process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.VENICE_MODEL || "venice-uncensored",
      messages,
      stream: false,
      max_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const raw = await response.text();
  let data: { choices?: { message?: { content?: string } }[] };
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Venice returned an unexpected response (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`Venice request failed (HTTP ${response.status}).`);
  const output = data.choices?.[0]?.message?.content;
  if (typeof output !== "string" || !output.trim()) throw new Error("Venice returned no text.");
  return output.trim();
}

export function resolveLlm(modelId?: string): LlmEntry {
  return (modelId && getLlm(modelId)) || UNCENSORED_LLM_CATALOG[0];
}

export async function chatWithChain(opts: {
  userId: string;
  messages: ChatMessage[];
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<ChainResult> {
  void opts.userId;
  const entry = resolveLlm(opts.modelId);
  const maxTokens = Math.min(Math.max(opts.maxTokens ?? 1024, 16), 4096);
  const temperature = Math.min(Math.max(opts.temperature ?? 0.7, 0), 2);
  const tried: string[] = [];
  const failures: string[] = [];

  // 1. Hosted Groq API. No local device or local model is needed.
  if (process.env.GROQ_API_KEY) {
    tried.push("groq");
    try {
      const text = await groqChatComplete(opts.messages, maxTokens, temperature);
      return { text, via: "groq", detail: "Groq hosted inference", tried };
    } catch (error) {
      failures.push(`Groq: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }

  // 2. Existing optional hosted fallback.
  if (omegaConfigured()) {
    tried.push("omega");
    try {
      const text = await omegaChatComplete(opts.messages, {
        model: entry.hostedModelId || entry.localModelId,
        maxTokens,
        temperature,
      });
      return { text, via: "omega", detail: "Omega AI hosted", tried };
    } catch (error) {
      failures.push(`Omega AI: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }

  // 3. Existing optional Venice fallback.
  if (process.env.VENICE_API_KEY) {
    tried.push("venice");
    try {
      const text = await chatViaVenice(opts.messages, maxTokens, temperature);
      return { text, via: "venice", detail: "Venice.ai hosted", tried };
    } catch (error) {
      failures.push(`Venice: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }

  if (failures.length) {
    throw new ChatUnavailableError(`All configured hosted chat providers failed. ${failures.join(" · ")}`);
  }
  throw new ChatUnavailableError(
    "NEXORA chat is not connected yet. Add GROQ_API_KEY in the Render environment to enable hosted chat. No Local Companion or local model is required."
  );
}
