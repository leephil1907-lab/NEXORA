/**
 * NEXORA provider layer — real inference contracts.
 *
 * There is exactly one source of truth for what a generation can do: the model
 * catalog. Settings that a model cannot accept are either disabled in the UI or
 * folded into the prompt (prompt conditioning is a real mechanism, and the UI
 * labels it as such). Nothing here simulates output.
 */

export type Modality = "image" | "video";

export type ProviderKind = "replicate" | "custom-image" | "custom-llm";

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9";
export type Resolution = "480p" | "720p" | "1080p";
export type GenerationMode = "standard" | "professional";
export type CameraMovement =
  | "static"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "dolly-in"
  | "dolly-out"
  | "orbit-left"
  | "orbit-right"
  | "handheld";

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  "static",
  "pan-left",
  "pan-right",
  "tilt-up",
  "tilt-down",
  "dolly-in",
  "dolly-out",
  "orbit-left",
  "orbit-right",
  "handheld",
];

export const ASPECT_RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
export const RESOLUTIONS: Resolution[] = ["480p", "720p", "1080p"];

export type GenerationSettings = {
  modelId: string;
  modality: Modality;
  durationSeconds: number;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  mode: GenerationMode;
  cameraMovement: CameraMovement;
  /** 1 = maximum creativity, 10 = maximum prompt relevance. */
  guidance: number;
  audio: boolean;
  sensitive: boolean;
};

export type ProviderJobStatus = "starting" | "processing" | "succeeded" | "failed" | "canceled";

export type StartJobArgs = {
  prompt: string;
  /** Publicly fetchable URL of the start-frame reference (signed by the caller). */
  imageUrl?: string;
  /** Publicly fetchable URL of the end frame (start-end-to-video capable models). */
  endImageUrl?: string;
  /** Publicly fetchable URL of a previous clip (video-extend capable models). */
  videoUrl?: string;
  settings: GenerationSettings;
};

export type ProviderJob = {
  providerJobId: string;
  status: ProviderJobStatus;
  outputUrl?: string;
  error?: string;
};

export type ModelCapabilities = {
  textToVideo: boolean;
  imageToVideo: boolean;
  /** Accepts a second image as the final frame. */
  startEndFrame: boolean;
  /** Accepts a previous clip to continue from (Extend). */
  videoExtend: boolean;
  /** Produces synchronized audio. */
  audio: boolean;
  negativePrompt: boolean;
  /** guidance_scale maps directly (otherwise the slider conditions the prompt). */
  directGuidance: boolean;
  /** Duration/resolution are direct parameters (otherwise they condition the prompt). */
  directDuration: boolean;
  directResolution: boolean;
  directAspect: boolean;
};

export type ModelEntry = {
  id: string;
  label: string;
  modality: Modality;
  provider: ProviderKind;
  /** Replicate official model slug, e.g. "wan-video/wan-2.2-i2v-fast". */
  replicateModel?: string;
  /** For version-pinned community models. */
  replicateVersion?: string;
  /** Custom-endpoint model id sent to the OpenAI-compatible backend. */
  endpointModelId?: string;
  source: string;
  tagline: string;
  durations: number[];
  resolutions: Resolution[];
  capabilities: ModelCapabilities;
};

export class ProviderNotConfiguredError extends Error {
  readonly code = "PROVIDER_NOT_CONFIGURED" as const;
  constructor(public readonly provider: ProviderKind) {
    super(
      provider === "replicate"
        ? "Replicate API token is not configured on this deployment. Set REPLICATE_API_TOKEN to enable generation."
        : provider === "custom-llm"
          ? "No custom LLM endpoint is configured on this deployment. Set NEXORA_LLM_ENDPOINT / NEXORA_LLM_API_KEY to enable the prompt assistant."
          : "No custom image endpoint is configured on this deployment. Set NEXORA_IMAGE_ENDPOINT / NEXORA_IMAGE_API_KEY to enable this model."
    );
    this.name = "ProviderNotConfiguredError";
  }
}

export interface GenerationProvider {
  kind: ProviderKind;
  start(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob>;
  get(providerJobId: string, model: ModelEntry): Promise<ProviderJob>;
}
