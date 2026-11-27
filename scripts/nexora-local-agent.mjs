#!/usr/bin/env node
/**
 * NEXORA Local Companion Agent
 *
 * Bridges NEXORA's authenticated cloud queue to a local OpenAI-compatible
 * inference server (for example Uncensored Local AI at 127.0.0.1:4891).
 * The agent makes outbound HTTPS requests only; it opens no inbound port.
 *
 * Required environment:
 *   NEXORA_URL=https://your-nexora-domain
 *   NEXORA_DEVICE_TOKEN=<one-time token issued by NEXORA>
 * Optional:
 *   LOCAL_LLM_URL=http://127.0.0.1:4891/v1
 *   LOCAL_LLM_MODEL=local
 *   POLL_INTERVAL_MS=2000
 */
const base = (process.env.NEXORA_URL || "").replace(/\/$/, "");
const token = process.env.NEXORA_DEVICE_TOKEN || "";
const localUrl = (process.env.LOCAL_LLM_URL || "http://127.0.0.1:4891/v1").replace(/\/$/, "");
const model = process.env.LOCAL_LLM_MODEL || "local";
const pollMs = Math.max(1000, Math.min(15000, Number(process.env.POLL_INTERVAL_MS || 2000)));

if (!/^https:\/\//.test(base)) throw new Error("NEXORA_URL must be an HTTPS URL.");
if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) throw new Error("NEXORA_DEVICE_TOKEN is missing or malformed.");

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) }, signal: AbortSignal.timeout(25000) });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { throw new Error(`Unexpected response from ${url}: HTTP ${response.status}`); }
  if (!response.ok) throw new Error(data.error || `Request failed: HTTP ${response.status}`);
  return data;
}

async function execute(command) {
  const input = command.input || {};
  const messages = [];
  if (input.systemPrompt) messages.push({ role: "system", content: input.systemPrompt });
  messages.push({ role: "user", content: input.prompt });
  const requestedModel = typeof input.model === "string" && input.model.trim() ? input.model.trim() : model;
  const response = await fetch(`${localUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: requestedModel, messages, stream: false,
      max_tokens: input.maxTokens || 512,
      temperature: input.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(10 * 60 * 1000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Local model returned invalid JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(data.error?.message || data.error || `Local model failed: HTTP ${response.status}`);
  const output = data.choices?.[0]?.message?.content;
  if (typeof output !== "string" || !output.trim()) throw new Error("Local model returned no text.");
  return output.slice(0, 50000);
}

console.log("NEXORA Local Companion connected. Waiting for cloud jobs…");
while (true) {
  try {
    const { command } = await jsonFetch(`${base}/api/local/agent/commands`);
    if (!command) { await sleep(pollMs); continue; }
    console.log(`Running local request ${command.id}`);
    try {
      const output = await execute(command);
      await jsonFetch(`${base}/api/local/agent/commands/${command.id}/complete`, {
        method: "POST", body: JSON.stringify({ output }),
      });
      console.log(`Completed ${command.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Local inference failed.";
      try {
        await jsonFetch(`${base}/api/local/agent/commands/${command.id}/complete`, {
          method: "POST", body: JSON.stringify({ error: message.slice(0, 1000) }),
        });
      } catch (submitError) {
        console.error("Could not report command failure:", submitError);
      }
      console.error(`Request ${command.id} failed:`, message);
    }
  } catch (error) {
    console.error("Companion connection error:", error instanceof Error ? error.message : error);
    await sleep(Math.min(pollMs * 3, 15000));
  }
}
