/**
 * Local-first chat chain.
 *
 * Order (the user's own machine always wins):
 *   1. local-device  — NEXORA Local Companion queue (the user's machine runs the
 *                      uncensored GGUF; agent polls the cloud queue)
 *   2. local-endpoint — operator GPU endpoint (NEXORA_LLM_ENDPOINT, llama.cpp /
 *                      LM Studio / Ollama / Uncensored Local AI, OpenAI-compatible)
 *   3. omega          — Omega AI hosted fallback (omegai.me, optional)
 *   4. venice         — Venice.ai hosted fallback (optional)
 * Every path is real inference. When nothing is connected the caller gets an
 * explicit, actionable configuration error — never a canned response.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { chatComplete, assistantConfigured } from "@/lib/providers";
import { omegaChatComplete, omegaConfigured } from "@/lib/providers/omega";
import { getLlm, UNCENSORED_LLM_CATALOG, type LlmEntry } from "@/lib/models/uncensored-catalog";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ChainVia = "local-device" | "local-endpoint" | "omega" | "venice";
export type ChainResult = { text: string; via: ChainVia; detail: string; tried: string[] };

export class ChatUnavailableError extends Error {
  readonly code = "CHAT_NOT_CONFIGURED" as const;
  constructor(message: string) {
    super(message);
    this.name = "ChatUnavailableError";
  }
}

function transcriptPrompt(messages: ChatMessage[]): { systemPrompt: string; prompt: string } {
  const systemPrompt = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n")
    .slice(0, 4000);
  const turns = messages.filter((m) => m.role !== "system");
  const prompt = turns
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}:\n${m.content}`)
    .join("\n\n");
  return { systemPrompt, prompt: `${prompt}\n\nAssistant:`.slice(0, 8000) };
}

async function chatViaLocalDevice(
  userId: string,
  entry: LlmEntry,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<ChainResult> {
  const admin = createAdminClient();
  const { data: device } = await admin
    .from("local_inference_devices")
    .select("id,name")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("last_seen_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (!device) throw new Error("no-device");

  const { systemPrompt, prompt } = transcriptPrompt(messages);
  const { data: command, error: insertError } = await admin
    .from("local_inference_commands")
    .insert({
      user_id: userId,
      device_id: device.id,
      kind: "chat",
      input: {
        prompt,
        systemPrompt,
        maxTokens,
        temperature,
        model: entry.localModelId,
      },
    })
    .select("id")
    .single();
  if (insertError || !command) throw new Error("Could not queue the local request.");

  const deadline = Date.now() + 55_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const { data: row } = await admin
      .from("local_inference_commands")
      .select("status,output,error_message")
      .eq("id", command.id)
      .maybeSingle();
    if (!row) continue;
    if (row.status === "completed" && typeof row.output === "string" && row.output.trim()) {
      return {
        text: row.output,
        via: "local-device",
        detail: `Local companion · ${device.name} · ${entry.label}`,
        tried: ["local-device"],
      };
    }
    if (row.status === "failed") {
      throw new Error(row.error_message || "The local device reported a failure.");
    }
  }
  throw new Error("The local device did not answer within 55 seconds.");
}

async function chatViaVenice(entry: LlmEntry, messages: ChatMessage[], maxTokens: number, temperature: number): Promise<string> {
  const key = process.env.VENICE_API_KEY;
  if (!key) throw new Error("Venice is not configured.");
  const base = (process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: entry.hostedModelId || "venice-uncensored",
      messages,
      stream: false,
      max_tokens: maxTokens,
      temperature,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();
  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Venice returned an unexpected response (HTTP ${response.status}).`);
  }
  if (!response.ok) throw new Error(`Venice request failed (HTTP ${response.status}).`);
  const output = data.choices?.[0]?.message?.content;
  if (typeof output !== "string" || !output.trim()) throw new Error("Venice returned no text.");
  return output;
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
  const entry = resolveLlm(opts.modelId);
  const maxTokens = Math.min(Math.max(opts.maxTokens ?? 1024, 16), 4096);
  const temperature = Math.min(Math.max(opts.temperature ?? 0.7, 0), 2);
  const tried: string[] = [];
  const failures: string[] = [];

  // 1. The user's own machine, via the Local Companion queue.
  try {
    const result = await chatViaLocalDevice(opts.userId, entry, opts.messages, maxTokens, temperature);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "local device unavailable";
    if (message !== "no-device") {
      tried.push("local-device");
      failures.push(`Local companion: ${message}`);
    }
  }

  // 2. Operator GPU endpoint (OpenAI-compatible).
  if (assistantConfigured()) {
    tried.push("local-endpoint");
    try {
      const text = await chatComplete(opts.messages, maxTokens);
      return { text, via: "local-endpoint", detail: `Self-hosted endpoint · ${entry.label}`, tried };
    } catch (error) {
      failures.push(`Self-hosted endpoint: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  // 3. Omega AI hosted fallback.
  if (omegaConfigured()) {
    tried.push("omega");
    try {
      const text = await omegaChatComplete(opts.messages, {
        model: entry.hostedVia === "omega" ? entry.hostedModelId || entry.localModelId : undefined,
        maxTokens,
        temperature,
      });
      return { text, via: "omega", detail: `Omega AI hosted · ${entry.label}`, tried };
    } catch (error) {
      failures.push(`Omega AI: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  // 4. Venice hosted fallback.
  if (process.env.VENICE_API_KEY) {
    tried.push("venice");
    try {
      const text = await chatViaVenice(entry, opts.messages, maxTokens, temperature);
      return { text, via: "venice", detail: `Venice.ai hosted · ${entry.label}`, tried };
    } catch (error) {
      failures.push(`Venice: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (failures.length > 0) {
    throw new ChatUnavailableError(
      `All connected engines failed for ${entry.label}. ${failures.join(" · ")}`
    );
  }
  throw new ChatUnavailableError(
    "No chat engine is connected. Primary path is your own machine: start the NEXORA Local Companion (scripts/nexora-local-agent.mjs) with a local model server such as llama.cpp, LM Studio, Ollama, or Uncensored Local AI. Optional hosted fallbacks: OMEGA_API_KEY (omegai.me) or VENICE_API_KEY (venice.ai). Self-hosted GPU: NEXORA_LLM_ENDPOINT."
  );
}
