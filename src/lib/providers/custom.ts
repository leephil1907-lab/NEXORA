import type { GenerationSettings, ModelEntry, ProviderJob, StartJobArgs, GenerationProvider } from "./types";
import { ProviderNotConfiguredError } from "./types";

/**
 * Bring-your-own GPU backends over OpenAI-compatible HTTP APIs.
 *
 * Prompt assistant (NEXORA_LLM_ENDPOINT):
 *   Any OpenAI-compatible /v1/chat/completions server — e.g. llama.cpp
 *   (llama-server) hosting:
 *     - AtomicChat/Inkling-2-Mini-Uncensored-GGUF
 *     - dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
 *
 * Image models (NEXORA_IMAGE_ENDPOINT):
 *   Any OpenAI-compatible /v1/images/generations server — e.g. LocalAI,
 *   ComfyUI (openai node), or a custom diffusers gateway hosting:
 *     - axiomofmind/Moss-image-nsfw-uncensored-lora-GGUF
 */

function llmEndpoint(): string {
  return (process.env.NEXORA_LLM_ENDPOINT ?? "").replace(/\/$/, "");
}
function imageEndpoint(): string {
  return (process.env.NEXORA_IMAGE_ENDPOINT ?? "").replace(/\/$/, "");
}

export function assistantConfigured(): boolean {
  return Boolean(llmEndpoint());
}

export function customImageConfigured(): boolean {
  return Boolean(imageEndpoint());
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatComplete(messages: ChatMessage[], maxTokens = 512): Promise<string> {
  const endpoint = llmEndpoint();
  if (!endpoint) throw new ProviderNotConfiguredError("custom-llm");
  const res = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXORA_LLM_API_KEY
        ? { Authorization: `Bearer ${process.env.NEXORA_LLM_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      model: process.env.NEXORA_LLM_MODEL ?? "default",
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string } | string;
  };
  if (!res.ok) {
    const detail = typeof body.error === "string" ? body.error : (body.error?.message ?? res.statusText);
    throw new Error(`LLM endpoint ${res.status}: ${detail}`);
  }
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM endpoint returned no completion.");
  return text.trim();
}

async function imageGenerate(prompt: string, aspectRatio: string): Promise<string> {
  const endpoint = imageEndpoint();
  if (!endpoint) throw new ProviderNotConfiguredError("custom-image");
  const res = await fetch(`${endpoint}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXORA_IMAGE_API_KEY
        ? { Authorization: `Bearer ${process.env.NEXORA_IMAGE_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      model: process.env.NEXORA_IMAGE_MODEL ?? "default",
      prompt,
      n: 1,
      size: aspectRatio === "16:9" ? "1536x864" : aspectRatio === "9:16" ? "864x1536" : "1024x1024",
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    data?: { url?: string; b64_json?: string }[];
    error?: { message?: string } | string;
  };
  if (!res.ok) {
    const detail = typeof body.error === "string" ? body.error : (body.error?.message ?? res.statusText);
    throw new Error(`Image endpoint ${res.status}: ${detail}`);
  }
  const item = body.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  throw new Error("Image endpoint returned no image data.");
}

/**
 * Custom-image provider. These gateways are synchronous (return the image in
 * the response), so `start` performs the job and `get` reports it as done.
 */
export const customImageProvider: GenerationProvider = {
  kind: "custom-image",

  async start(args: StartJobArgs, _model: ModelEntry): Promise<ProviderJob> {
    const s: GenerationSettings = args.settings;
    const camera = s.cameraMovement === "static" ? "" : `, camera ${s.cameraMovement.replace("-", " ")}`;
    const prompt = `${args.prompt}${camera}${s.mode === "professional" ? ", professional mode, cinematic quality" : ""}`;
    const outputUrl = await imageGenerate(prompt, s.aspectRatio);
    return { providerJobId: `custom-${Date.now()}`, status: "succeeded", outputUrl };
  },

  async get(_providerJobId: string): Promise<ProviderJob> {
    return { providerJobId: _providerJobId, status: "succeeded" };
  },
};
