import type { GenerationProvider, ModelEntry, ProviderJob, StartJobArgs } from "./types";

const API = "https://generativelanguage.googleapis.com/v1beta";
const key = () => process.env.GEMINI_API_KEY || "";

// The upstream Gemini API has several polymorphic response shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;
async function request(path: string, init: RequestInit = {}): Promise<Json> {
  const apiKey = key();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing on the server.");
  const response = await fetch(API + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
      ...(init.headers || {}),
    },
    signal: init.signal || AbortSignal.timeout(55_000),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch {}
  if (!response.ok) {
    const detail = body.error?.message || body.message || `HTTP ${response.status}`;
    if (response.status === 403 || response.status === 429 || /billing|paid tier|free tier|quota|payment/i.test(String(detail))) {
      throw new Error(`Google Gemini rejected this generation: ${detail}. Gemini image and video generation require an eligible paid Gemini API project; a free-tier text API key is not enough.`);
    }
    throw new Error(`Google Gemini API ${response.status}: ${detail}`);
  }
  return body;
}
async function imageData(url: string): Promise<{ data: string; mime: string }> {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error("Could not retrieve the selected reference image.");
  const mime = (response.headers.get("content-type") || "image/jpeg").split(";")[0].toLowerCase();
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) throw new Error("Gemini reference images must be JPG, PNG or WebP.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 20 * 1024 * 1024) throw new Error("Reference image exceeds the 20 MB Gemini limit.");
  return { data: bytes.toString("base64"), mime };
}
function extractVideo(body: Json): string | undefined {
  for (const step of body.steps || []) {
    if (step.type !== "model_output") continue;
    for (const item of step.content || []) {
      if (item.type !== "video") continue;
      if (item.data) return `data:${item.mime_type || "video/mp4"};base64,${item.data}`;
      // Gemini Omni may return a Google Files API download URI instead of inline bytes.
      if (typeof item.uri === "string") return item.uri;
      if (typeof item.url === "string") return item.url;
    }
  }
  const out = body.output_video || body.outputVideo;
  if (out?.data) return `data:${out.mime_type || "video/mp4"};base64,${out.data}`;
  if (typeof out?.uri === "string") return out.uri;
  if (typeof out?.url === "string") return out.url;
  return undefined;
}
function status(value: string): ProviderJob["status"] {
  if (value === "completed" || value === "succeeded") return "succeeded";
  if (value === "failed" || value === "cancelled" || value === "canceled") return "failed";
  return "processing";
}

export const geminiImageProvider: GenerationProvider = {
  kind: "gemini-image",
  async start(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob> {
    const parts: Json[] = [{ text: args.prompt }];
    if (args.imageUrl) {
      const image = await imageData(args.imageUrl);
      parts.unshift({ inline_data: { mime_type: image.mime, data: image.data } });
    }
    const body = await request(`/models/${encodeURIComponent(model.endpointModelId || "gemini-3.1-flash-lite-image")}:generateContent`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: args.settings.aspectRatio, imageSize: "1K" } },
      }),
    });
    const candidates = body.candidates || [];
    for (const candidate of candidates) {
      for (const part of candidate.content?.parts || []) {
        const data = part.inlineData?.data || part.inline_data?.data;
        const mime = part.inlineData?.mimeType || part.inline_data?.mime_type || "image/png";
        if (data) return { providerJobId: "gemini-image-" + crypto.randomUUID(), status: "succeeded", outputUrl: `data:${mime};base64,${data}` };
      }
    }
    const block = body.promptFeedback?.blockReason;
    throw new Error(block ? `Gemini blocked this image prompt: ${block}` : "Gemini returned no image data. Check the selected model and API billing access.");
  },
  async get(providerJobId: string): Promise<ProviderJob> {
    return { providerJobId, status: "succeeded" };
  },
};

export const geminiVideoProvider: GenerationProvider = {
  kind: "gemini-video",
  async start(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob> {
    const input: Json[] = [];
    if (args.imageUrl) {
      const image = await imageData(args.imageUrl);
      input.push({ type: "image", data: image.data, mime_type: image.mime });
    }
    if (args.endImageUrl) {
      const image = await imageData(args.endImageUrl);
      input.push({ type: "image", data: image.data, mime_type: image.mime });
    }
    const camera = args.settings.cameraMovement === "static" ? "" : ` Camera movement: ${args.settings.cameraMovement.replace(/-/g, " ")}.`;
    const frameInstruction = args.endImageUrl ? "Use the first reference image as the opening frame and the second reference image as the final frame. Create coherent motion that connects the two frames. " : "";
    input.push({ type: "text", text: frameInstruction + args.prompt + camera });
    const duration = Math.min(15, Math.max(3, args.settings.durationSeconds || 5));
    const resolution = args.settings.resolution === "1080p" ? "1080p" : "720p";
    const task = args.imageUrl ? "image_to_video" : "text_to_video";
    const body = await request("/interactions", {
      method: "POST",
      body: JSON.stringify({
        model: model.endpointModelId || "gemini-omni-1.2-flash",
        input,
        generation_config: { video_config: { task } },
        background: true,
        response_format: {
          type: "video",
          delivery: "uri",
          aspect_ratio: args.settings.aspectRatio === "9:16" ? "9:16" : "16:9",
          duration: `${duration}s`,
          resolution,
        },
      }),
    });
    if (typeof body.id !== "string") throw new Error("Gemini did not return a video interaction ID.");
    return { providerJobId: body.id, status: status(String(body.status || "in_progress")) };
  },
  async get(providerJobId: string): Promise<ProviderJob> {
    const body = await request(`/interactions/${encodeURIComponent(providerJobId)}`, { method: "GET", headers: { "Api-Revision": "2026-05-20" } });
    const current = status(String(body.status || "in_progress"));
    const outputUrl = current === "succeeded" ? extractVideo(body) : undefined;
    if (current === "succeeded" && !outputUrl) return { providerJobId, status: "failed", error: "Gemini completed the video task but returned no downloadable MP4 data." };
    const errors = body.error?.message || body.errors?.[0]?.message;
    return { providerJobId, status: current, outputUrl, error: errors ? String(errors) : undefined };
  },
};
