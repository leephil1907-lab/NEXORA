/**
 * Hosted-first chat engine. Gemini is primary, with configured Omega and Venice fallbacks.
 */
import { omegaChatComplete, omegaConfigured } from "@/lib/providers/omega";
import { getLlm, UNCENSORED_LLM_CATALOG, type LlmEntry } from "@/lib/models/uncensored-catalog";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ChainVia = "gemini" | "omega" | "venice";
export type ChainResult = { text: string; via: ChainVia; detail: string; tried: string[] };

export class ChatUnavailableError extends Error {
  readonly code = "CHAT_NOT_CONFIGURED" as const;
  constructor(message: string) {
    super(message);
    this.name = "ChatUnavailableError";
  }
}

async function geminiChatComplete(messages: ChatMessage[], maxTokens: number, temperature: number): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured.");
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const system = messages.find((message) => message.role === "system")?.content;
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );
  const raw = await response.text();
  let data: {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  try { data = JSON.parse(raw); }
  catch { throw new Error(`Gemini returned an unexpected response (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (HTTP ${response.status}).`);
  const output = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (typeof output !== "string" || !output.trim()) throw new Error("Gemini returned no text.");
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

  // 1. Gemini hosted API. Free-tier model access is available on eligible projects.
  if (process.env.GEMINI_API_KEY) {
    tried.push("gemini");
    try {
      const text = await geminiChatComplete(opts.messages, maxTokens, temperature);
      return { text, via: "gemini", detail: "Google Gemini hosted inference", tried };
    } catch (error) {
      failures.push(`Gemini: ${error instanceof Error ? error.message : "request failed"}`);
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
    "NEXORA chat is not connected yet. Add GEMINI_API_KEY in the Render environment to enable hosted chat. No Local Companion or local model is required."
  );
}
