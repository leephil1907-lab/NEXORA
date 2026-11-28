import type { GenerationProvider, ModelEntry, ProviderJob, StartJobArgs } from "./types";
import { ProviderNotConfiguredError } from "./types";

const REPLICATE_API = "https://api.replicate.com/v1";

function token(): string {
  return process.env.REPLICATE_API_TOKEN ?? "";
}

type ReplicateInput = Record<string, string | number | boolean | null | undefined>;

function buildInput(model: ModelEntry, args: StartJobArgs): ReplicateInput {
  const s = args.settings;
  const camera = s.cameraMovement === "static" ? "" : `, camera ${s.cameraMovement.replace("-", " ")}`;
  const modeNote = s.mode === "professional" ? ", professional mode, high detail, cinematic quality" : "";
  const prompt = `${args.prompt}${camera}${modeNote}`.trim();

  switch (model.id) {
    case "wan-2.2-t2v-fast":
      return {
        prompt,
        num_frames: 81,
        resolution: s.resolution === "1080p" ? "720p" : s.resolution,
        aspect_ratio: s.aspectRatio,
        go_fast: true,
      };

    case "wan-2.2-i2v-fast":
      return {
        prompt,
        image: args.imageUrl,
        num_frames: 81,
        resolution: s.resolution === "1080p" ? "720p" : s.resolution,
        go_fast: true,
        sample_shift: 12,
        frames_per_second: 16,
      };

    case "wan-2.2-i2v-a14b":
      return {
        prompt,
        image: args.imageUrl,
        go_fast: s.mode !== "professional",
        num_frames: 81,
        resolution: s.resolution === "1080p" ? "720p" : s.resolution,
        sample_steps: s.mode === "professional" ? 50 : 30,
        sample_shift: 5,
        frames_per_second: 16,
      };

    case "wan-2.5-t2v": {
      const sizes: Record<string, Record<string, string>> = {
        "16:9": { "480p": "832*480", "720p": "1280*720", "1080p": "1920*1080" },
        "9:16": { "480p": "480*832", "720p": "720*1280", "1080p": "1080*1920" },
        "1:1": { "480p": "640*640", "720p": "1024*1024", "1080p": "1440*1440" },
        "4:3": { "480p": "640*480", "720p": "960*720", "1080p": "1440*1080" },
        "3:4": { "480p": "480*640", "720p": "720*960", "1080p": "1080*1440" },
        "21:9": { "480p": "896*384", "720p": "1280*544", "1080p": "1920*816" },
      };
      return {
        prompt,
        size: sizes[s.aspectRatio]?.[s.resolution] ?? "1280*720",
        duration: s.durationSeconds,
        negative_prompt: "blurry, distorted, low quality, deformed anatomy, extra fingers, watermark, text overlay",
        enable_prompt_expansion: true,
      };
    }

    case "wan-2.5-i2v":
      return {
        prompt,
        image: args.imageUrl,
        duration: s.durationSeconds,
        resolution: s.resolution,
        negative_prompt: "blurry, distorted, low quality, deformed anatomy, extra fingers, watermark, text overlay",
        enable_prompt_expansion: true,
      };

    case "ltx-video-0.9.7-distilled": {
      const input: ReplicateInput = {
        prompt,
        go_fast: s.mode !== "professional",
        resolution: s.resolution === "1080p" ? 720 : Number.parseInt(s.resolution, 10),
        aspect_ratio: s.aspectRatio,
        num_frames: Math.min(257, Math.max(9, Math.round(s.durationSeconds * 24 / 8) * 8 + 1)),
        guidance_scale: Math.min(10, Math.max(1, s.guidance)),
        negative_prompt: "worst quality, inconsistent motion, blurry, jittery, distorted",
      };
      if (args.videoUrl) input.video = args.videoUrl;
      else if (args.imageUrl) input.image = args.imageUrl;
      return input;
    }

    case "flux-kontext-dev":
      return args.imageUrl
        ? { prompt, input_image: args.imageUrl, aspect_ratio: s.aspectRatio }
        : { prompt, aspect_ratio: s.aspectRatio };

    case "flux-schnell":
      return {
        prompt,
        go_fast: true,
        num_outputs: 1,
        aspect_ratio: s.aspectRatio,
        output_format: "webp",
        output_quality: 90,
      };

    default:
      throw new Error(`No verified Replicate input adapter exists for model ${model.id}.`);
  }
}

function mapStatus(status: string): ProviderJob["status"] {
  switch (status) {
    case "starting":
    case "queued":
      return "starting";
    case "processing":
      return "processing";
    case "succeeded":
      return "succeeded";
    case "canceled":
      return "canceled";
    default:
      return "failed";
  }
}

function extractOutput(output: unknown): string | undefined {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

async function replicateFetch(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const auth = token();
  if (!auth) throw new ProviderNotConfiguredError("replicate");
  const response = await fetch(`${REPLICATE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: init?.signal ?? AbortSignal.timeout(60_000),
  });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
    throw new Error(`Replicate API ${response.status}: ${detail}`);
  }
  return body;
}

export const replicateProvider: GenerationProvider = {
  kind: "replicate",

  async start(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob> {
    const input = buildInput(model, args);
    const path = model.replicateVersion
      ? "/predictions"
      : model.replicateModel
        ? `/models/${model.replicateModel}/predictions`
        : "";
    if (!path) throw new Error(`No Replicate model identifier is configured for ${model.id}.`);
    const payload: Record<string, unknown> = model.replicateVersion
      ? { version: model.replicateVersion, input }
      : { input };
    const data = await replicateFetch(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (typeof data.id !== "string") throw new Error("Replicate did not return a prediction ID.");
    return { providerJobId: data.id, status: mapStatus(String(data.status)) };
  },

  async get(providerJobId: string): Promise<ProviderJob> {
    const data = await replicateFetch(`/predictions/${encodeURIComponent(providerJobId)}`);
    return {
      providerJobId,
      status: mapStatus(String(data.status)),
      outputUrl: extractOutput(data.output),
      error: typeof data.error === "string" ? data.error : undefined,
    };
  },
};
