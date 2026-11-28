import type {
  GenerationProvider,
  ModelEntry,
  ProviderJob,
  StartJobArgs,
} from "./types";
import { ProviderNotConfiguredError } from "./types";

const REPLICATE_API = "https://api.replicate.com/v1";

function token(): string {
  return process.env.REPLICATE_API_TOKEN ?? "";
}

type ReplicateInput = Record<string, string | number | boolean | null | undefined>;

/**
 * Input builders per model. Only fields the model's published schema accepts are
 * ever sent — unknown fields are rejected by Replicate, so the catalog's
 * capabilities drive what the UI exposes and what gets mapped.
 */
function buildInput(model: ModelEntry, args: StartJobArgs): ReplicateInput {
  const s = args.settings;
  const camera = s.cameraMovement === "static" ? "" : `, camera ${s.cameraMovement.replace("-", " ")}`;
  const modeNote = s.mode === "professional" ? ", professional mode, highest detail, cinematic quality" : "";
  const prompt = `${args.prompt}${camera}${modeNote}`.trim();

  switch (model.id) {
    case "wan-2.2-t2v-fast":
      // Schema: { prompt }
      return { prompt };

    case "flux-kontext-dev":
      // Schema: { prompt, input_image, aspect_ratio, ... } — instruction-based editing
      return args.imageUrl
        ? { prompt, input_image: args.imageUrl }
        : { prompt };

    case "wan-2.2-i2v-fast":
      // Schema: { image, prompt }
      return { prompt, image: args.imageUrl ?? "" };

    case "wan-2.2-i2v-a14b": {
      // Schema: { seed, image, prompt, go_fast, num_frames, resolution,
      //           sample_shift, sample_steps, frames_per_second }
      return {
        prompt,
        image: args.imageUrl ?? "",
        go_fast: s.mode !== "professional",
        num_frames: 81,
        resolution: s.resolution === "1080p" ? "720p" : s.resolution,
        sample_steps: s.mode === "professional" ? 50 : 30,
        frames_per_second: 16,
      };
    }

    case "wan-2.5-t2v": {
      // Wan 2.5 T2V expects a size string, not the I2V resolution field.
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

    case "wan-2.5-i2v": {
      // Wan 2.5 I2V expects an image URL and a resolution string.
      const input: ReplicateInput = {
        prompt,
        duration: s.durationSeconds,
        resolution: s.resolution,
        negative_prompt: "blurry, distorted, low quality, deformed anatomy, extra fingers, watermark, text overlay",
        enable_prompt_expansion: true,
      };
      if (args.imageUrl) input.image = args.imageUrl;
      return input;
    }

    case "ltx-video":
    case "ltx-video-0.9.7": {
      // Schema: { prompt, image, negative_prompt, width, height, num_frames,
      //           num_inference_steps, guidance_scale, fps, seed }
      const [w, h] = aspectToSize(s.aspectRatio, s.resolution);
      return {
        prompt,
        image: args.imageUrl ?? undefined,
        negative_prompt: "worst quality, inconsistent motion, blurry, jittery, distorted",
        width: w,
        height: h,
        num_frames: frameCount(s.durationSeconds),
        fps: 24,
        num_inference_steps: s.mode === "professional" ? 50 : 30,
        guidance_scale: guidanceToScale(s.guidance),
      };
    }

    case "ltx-video-0.9.7-distilled": {
      // Schema: { prompt, image, video, resolution, aspect_ratio, num_frames, ... }
      const input: ReplicateInput = {
        prompt,
        resolution: s.resolution === "1080p" ? 720 : parseInt(s.resolution, 10),
        aspect_ratio: s.aspectRatio,
        num_frames: frameCount(s.durationSeconds),
      };
      if (args.videoUrl) input.video = args.videoUrl;
      else if (args.imageUrl) input.image = args.imageUrl;
      return input;
    }

    case "flux-schnell":
      // Schema: { prompt, go_fast, megapixels, num_outputs, aspect_ratio,
      //           output_format, output_quality, seed }
      return {
        prompt,
        go_fast: true,
        num_outputs: 1,
        aspect_ratio: s.aspectRatio,
        output_format: "webp",
        output_quality: 90,
      };

    default:
      return { prompt };
  }
}

function aspectToSize(aspect: string, resolution: string): [number, number] {
  const long = resolution === "1080p" ? 1024 : resolution === "720p" ? 768 : 512;
  const map: Record<string, [number, number]> = {
    "16:9": [long, Math.round((long * 9) / 16 / 32) * 32],
    "9:16": [Math.round((long * 9) / 16 / 32) * 32, long],
    "1:1": [long, long],
    "4:3": [long, Math.round((long * 3) / 4 / 32) * 32],
    "3:4": [Math.round((long * 3) / 4 / 32) * 32, long],
    "21:9": [long, Math.round((long * 9) / 21 / 32) * 32],
  };
  return map[aspect] ?? [long, Math.round((long * 9) / 16 / 32) * 32];
}

/** LTX requires frame counts of 8N+1 (9, 17, 25, ... 161). */
function frameCount(seconds: number): number {
  const target = Math.min(257, Math.max(9, Math.round(seconds * 24)));
  return Math.round((target - 1) / 8) * 8 + 1;
}

/** UI slider is 1 (creative) → 10 (relevant); LTX guidance_scale is 1–10. */
function guidanceToScale(guidance: number): number {
  return Math.min(10, Math.max(1, guidance));
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
  const t = token();
  if (!t) throw new ProviderNotConfiguredError("replicate");
  const res = await fetch(`${REPLICATE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
    throw new Error(`Replicate API ${res.status}: ${detail}`);
  }
  return body;
}

export const replicateProvider: GenerationProvider = {
  kind: "replicate",

  async start(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob> {
    const input = buildInput(model, args);
    // Replicate has distinct routes for version-pinned community models and
    // official models. Official models must be called through /models/{owner}/{name}/predictions;
    // sending { model: ... } to /predictions is not a valid request body.
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
    return {
      providerJobId: String(data.id),
      status: mapStatus(String(data.status)),
    };
  },

  async get(providerJobId: string): Promise<ProviderJob> {
    const data = await replicateFetch(`/predictions/${providerJobId}`);
    return {
      providerJobId,
      status: mapStatus(String(data.status)),
      outputUrl: extractOutput(data.output),
      error: typeof data.error === "string" ? data.error : undefined,
    };
  },
};
