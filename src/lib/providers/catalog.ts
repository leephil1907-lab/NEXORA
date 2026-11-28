import type { ModelEntry, ModelCapabilities } from "./types";

const cap = (partial: Partial<ModelCapabilities>): ModelCapabilities => ({
  textToVideo: false,
  imageToVideo: false,
  referenceImage: false,
  startEndFrame: false,
  videoExtend: false,
  audio: false,
  negativePrompt: false,
  directGuidance: false,
  directDuration: false,
  directResolution: false,
  directAspect: false,
  ...partial,
});

/**
 * Generation models supported by the server-side provider adapters.
 * The public config endpoint exposes only entries whose provider is configured.
 */
export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: "gemini-3.1-flash-lite-image",
    label: "Gemini 3.1 Flash Lite Image",
    modality: "image",
    provider: "gemini-image",
    endpointModelId: "gemini-3.1-flash-lite-image",
    source: "Google Gemini · Nano Banana 2 Lite",
    tagline: "Native image generation and reference-image editing.",
    durations: [0],
    resolutions: ["1080p"],
    capabilities: cap({ referenceImage: true, directAspect: true }),
  },
  {
    id: "gemini-omni-1.2-flash",
    label: "Gemini Omni 1.2 Flash",
    modality: "video",
    provider: "gemini-video",
    endpointModelId: "gemini-omni-1.2-flash",
    source: "Google Gemini · Omni",
    tagline: "Native text-to-video and image-to-video with generated audio.",
    durations: [5, 10],
    resolutions: ["720p", "1080p"],
    capabilities: cap({ textToVideo: true, imageToVideo: true, startEndFrame: true, audio: true, directDuration: true, directResolution: true, directAspect: true }),
  },
];

export const ASSISTANT_CATALOG = [
  {
    id: "gemini",
    label: "Google Gemini",
    source: "Google · Gemini API",
    deployment: "Configured with GEMINI_API_KEY on the server.",
  },
] as const;

export function getModel(id: string): ModelEntry | undefined {
  return MODEL_CATALOG.find((model) => model.id === id);
}

export function publicCatalog() {
  return MODEL_CATALOG.map((model) => ({
    id: model.id,
    label: model.label,
    modality: model.modality,
    provider: model.provider,
    source: model.source,
    tagline: model.tagline,
    durations: model.durations,
    resolutions: model.resolutions,
    capabilities: model.capabilities,
  }));
}
