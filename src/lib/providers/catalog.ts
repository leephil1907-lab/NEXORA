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
 * NEXORA model catalog — every entry maps to a real, publicly documented model.
 *
 * Hosted on Replicate (real cloud GPUs):
 *   - wan-video/wan-2.2-t2v-fast, wan-video/wan-2.2-i2v-fast  (PrunaAI-optimized Wan 2.2)
 *   - wan-video/wan-2.5-t2v, wan-video/wan-2.5-i2v            (Wan 2.5, one-pass A/V sync)
 *   - lightricks/ltx-video, lightricks/ltx-video-0.9.7-distilled (LTX-Video)
 *   - black-forest-labs/flux-schnell                          (image)
 *
 * Bring-your-own endpoints (self-hosted GPU, OpenAI-compatible APIs):
 *   - axiomofmind/Moss-image-nsfw-uncensored-lora-GGUF        (image, via NEXORA_IMAGE_ENDPOINT)
 *   - AtomicChat/Inkling-2-Mini-Uncensored-GGUF               (assistant, via NEXORA_LLM_ENDPOINT)
 *   - dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4           (assistant, via NEXORA_LLM_ENDPOINT)
 */
export const MODEL_CATALOG: ModelEntry[] = [
  {
    id: "wan-2.2-t2v-fast",
    label: "Wan 2.2 T2V Fast",
    modality: "video",
    provider: "replicate",
    replicateModel: "wan-video/wan-2.2-t2v-fast",
    source: "Replicate · Alibaba Tongyi Lab (PrunaAI optimized)",
    tagline: "Fastest text-to-video. 5s clips in ~40s at 480p.",
    durations: [5],
    resolutions: ["480p", "720p"],
    capabilities: cap({ textToVideo: true }),
  },
  {
    id: "wan-2.2-i2v-fast",
    label: "Wan 2.2 I2V Fast",
    modality: "video",
    provider: "replicate",
    replicateModel: "wan-video/wan-2.2-i2v-fast",
    source: "Replicate · Alibaba Tongyi Lab (PrunaAI optimized)",
    tagline: "Animate a still image. 10M+ runs — the workhorse image-to-video model.",
    durations: [5],
    resolutions: ["480p", "720p"],
    capabilities: cap({ imageToVideo: true, textToVideo: true }),
  },
  {
    id: "wan-2.2-i2v-a14b",
    label: "Wan 2.2 I2V A14B",
    modality: "video",
    provider: "replicate",
    replicateModel: "wan-video/wan-2.2-i2v-a14b",
    source: "Replicate · Alibaba Tongyi Lab",
    tagline: "Full-quality Wan 2.2 image-to-video at 480p/720p with step control.",
    durations: [5],
    resolutions: ["480p", "720p"],
    capabilities: cap({
      imageToVideo: true,
      textToVideo: true,
      directDuration: true,
      directResolution: true,
    }),
  },
  {
    id: "wan-2.5-t2v",
    label: "Wan 2.5 T2V",
    modality: "video",
    provider: "replicate",
    replicateModel: "wan-video/wan-2.5-t2v",
    source: "Replicate · Alibaba Tongyi Lab",
    tagline: "Richer text-to-video with synchronized audio. Up to 10s.",
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    capabilities: cap({ textToVideo: true, audio: true, negativePrompt: true, directDuration: true, directResolution: true }),
  },
  {
    id: "wan-2.5-i2v",
    label: "Wan 2.5 I2V",
    modality: "video",
    provider: "replicate",
    replicateModel: "wan-video/wan-2.5-i2v",
    source: "Replicate · Alibaba Tongyi Lab",
    tagline: "Image-to-video with one-pass A/V sync and lip-sync. Custom-voice support.",
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    capabilities: cap({
      imageToVideo: true,
      textToVideo: true,
      audio: true,
      negativePrompt: true,
      directDuration: true,
      directResolution: true,
    }),
  },
  {
    id: "ltx-video",
    label: "LTX-Video",
    modality: "video",
    provider: "replicate",
    replicateModel: "lightricks/ltx-video",
    source: "Replicate · Lightricks",
    tagline: "Real-time DiT video with full parameter control (guidance, frames, seed).",
    durations: [5, 10],
    resolutions: ["480p", "720p"],
    capabilities: cap({
      textToVideo: true,
      imageToVideo: true,
      negativePrompt: true,
      directGuidance: true,
      directDuration: true,
      directResolution: true,
      directAspect: true,
    }),
  },
  {
    id: "ltx-video-0.9.7",
    label: "LTX-Video 0.9.7",
    modality: "video",
    provider: "replicate",
    replicateModel: "lightricks/ltx-video-0.9.7",
    source: "Replicate · Lightricks",
    tagline: "Highest-fidelity LTX at 30 FPS up to 1216×704. Full parameter control.",
    durations: [5, 10],
    resolutions: ["720p", "1080p"],
    capabilities: cap({
      textToVideo: true,
      imageToVideo: true,
      negativePrompt: true,
      directGuidance: true,
      directDuration: true,
      directResolution: true,
      directAspect: true,
    }),
  },
  {
    id: "ltx-video-0.9.7-distilled",
    label: "LTX-Video 0.9.7 Distilled",
    modality: "video",
    provider: "replicate",
    replicateModel: "lightricks/ltx-video-0.9.7-distilled",
    replicateVersion: "e7f2778ec419047c564a6620b2d9bf7d6c64673411bf2ae13e628ee2b2c0b5b1",
    source: "Replicate · Lightricks",
    tagline: "Fast 480p/720p video. Text, image, or video input — extend clips in both directions.",
    durations: [5, 10],
    resolutions: ["480p", "720p"],
    capabilities: cap({
      textToVideo: true,
      imageToVideo: true,
      videoExtend: true,
      directResolution: true,
    }),
  },
  {
    id: "flux-schnell",
    label: "FLUX.1 [schnell]",
    modality: "image",
    provider: "replicate",
    replicateModel: "black-forest-labs/flux-schnell",
    source: "Replicate · Black Forest Labs",
    tagline: "Photorealistic stills in seconds. Native aspect-ratio control.",
    durations: [0],
    resolutions: ["1080p"],
    capabilities: cap({ textToVideo: true, directAspect: true }),
  },
  {
    id: "flux-kontext-dev",
    label: "FLUX.1 Kontext [dev]",
    modality: "image",
    provider: "replicate",
    replicateModel: "black-forest-labs/flux-kontext-dev",
    source: "Replicate · Black Forest Labs",
    tagline: "Instruction-based image editing. Upload a reference and describe the change — restyle, relight, repose.",
    durations: [0],
    resolutions: ["1080p"],
    capabilities: cap({ textToVideo: true, referenceImage: true, directAspect: true }),
  },
  {
    id: "moss-gguf-lora",
    label: "MOSS Image · Uncensored LoRA (GGUF)",
    modality: "image",
    provider: "custom-image",
    endpointModelId: "moss-image-nsfw-uncensored-lora",
    source: "Self-hosted · axiomofmind/Moss-image-nsfw-uncensored-lora-GGUF",
    tagline: "Bring-your-own GPU endpoint. Serve the GGUF LoRA pipeline and point NEXORA at it.",
    durations: [0],
    resolutions: ["1080p"],
    capabilities: cap({ textToVideo: true, directAspect: true, directGuidance: true }),
  },
];

/**
 * Prompt-assistant models. These are OpenAI-compatible chat backends (for
 * example llama.cpp server hosting the GGUF builds below). The assistant is a
 * real inference call to the operator's own GPU — never a canned response.
 */
export const ASSISTANT_CATALOG = [
  {
    id: "inkling-2-mini",
    label: "Inkling 2 Mini (Uncensored GGUF)",
    source: "Self-hosted · AtomicChat/Inkling-2-Mini-Uncensored-GGUF",
    deployment:
      "llama-server -m Inkling-2-Mini-Uncensored-AD-Q4_K.gguf --mmproj mmproj-Inkling-2-Mini-Uncensored-F16.gguf --jinja -c 32768 -ngl 99",
  },
  {
    id: "dongfangshuo-qwen3.8",
    label: "Dongfangshuo Qwen3.8 27B (NSFW GGUF)",
    source: "Self-hosted · dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4",
    deployment: "Serve with llama.cpp (llama-server) or any OpenAI-compatible runtime, then set NEXORA_LLM_MODEL.",
  },
] as const;

export function getModel(id: string): ModelEntry | undefined {
  return MODEL_CATALOG.find((m) => m.id === id);
}

export function publicCatalog() {
  return MODEL_CATALOG.map((m) => ({
    id: m.id,
    label: m.label,
    modality: m.modality,
    provider: m.provider,
    source: m.source,
    tagline: m.tagline,
    durations: m.durations,
    resolutions: m.resolutions,
    capabilities: m.capabilities,
  }));
}
