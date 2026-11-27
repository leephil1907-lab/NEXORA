/**
 * Omega AI (omegai.me) — OpenAI-compatible hosted chat backend.
 *   POST {OMEGA_BASE_URL}/chat/completions   (default https://omegai.me/api/v1)
 *   GET  {OMEGA_BASE_URL}/models
 * Documented by the OmegaCode CLI project (github.com/alaashamaa017-cell/omegacode-cli-uncensored-AI).
 * Optional fallback in the local-first chain — the user's own machine always wins.
 */

const DEFAULT_BASE = "https://omegai.me/api/v1";

export function omegaConfigured(): boolean {
  return Boolean(process.env.OMEGA_API_KEY);
}

export function omegaBaseUrl(): string {
  return (process.env.OMEGA_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

export type OmegaMessage = { role: "system" | "user" | "assistant"; content: string };

export async function omegaChatComplete(
  messages: OmegaMessage[],
  opts: { model?: string; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const key = process.env.OMEGA_API_KEY;
  if (!key) throw new Error("Omega AI is not configured. Set OMEGA_API_KEY to enable the hosted fallback.");
  const response = await fetch(`${omegaBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: opts.model || process.env.OMEGA_MODEL || "omega-code",
      messages,
      stream: false,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();
  let data: { choices?: { message?: { content?: string } }[]; error?: { message?: string } | string };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Omega AI returned an unexpected response (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const msg = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(msg || `Omega AI request failed (HTTP ${response.status}).`);
  }
  const output = data.choices?.[0]?.message?.content;
  if (typeof output !== "string" || !output.trim()) throw new Error("Omega AI returned no text.");
  return output;
}
