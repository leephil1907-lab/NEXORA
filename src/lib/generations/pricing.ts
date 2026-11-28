import type { GenerationSettings, ModelEntry } from "@/lib/providers/types";

/**
 * Real credit economy. Amounts are configurable via environment (NEXORA_* with
 * NEXORA_* fallback for older deployments) and displayed live in the UI before
 * every run — the deduction is the exact number shown.
 *
 *   image: configured image base credits
 *   video: configured video base credits × (duration / 5s)
 */
function envInt(names: string[], fallback: number): number {
  for (const name of names) {
    const raw = process.env[name];
    if (raw) {
      const n = Number.parseInt(raw, 10);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  }
  return fallback;
}

export function imageCreditCost(): number {
  return envInt(["NEXORA_IMAGE_CREDIT_COST", "NEXORA_IMAGE_CREDIT_COST"], 1);
}

export function videoCreditBase(): number {
  return envInt(["NEXORA_VIDEO_CREDIT_COST", "NEXORA_VIDEO_CREDIT_COST"], 10);
}

export function maxUploadMb(): number {
  return envInt(["NEXORA_MAX_UPLOAD_MB", "NEXORA_MAX_UPLOAD_MB"], 20);
}

export function creditCost(settings: Pick<GenerationSettings, "modality" | "durationSeconds" | "mode">): number {
  if (settings.modality === "image") return imageCreditCost();
  return Math.max(1, Math.ceil(videoCreditBase() * (settings.durationSeconds / 5)));
}

export function costBreakdown(settings: GenerationSettings): string {
  const total = creditCost(settings);
  if (settings.modality === "image") {
    return `${imageCreditCost()} base`;
  }
  const parts = [
    `${videoCreditBase()} per 5s`,
    `${settings.durationSeconds}s`,
    "standard quality",
  ];
  return `${parts.join(" · ")} = ${total} credits`;
}

export function modelCostLabel(model: ModelEntry): string {
  if (model.modality === "image") return `${imageCreditCost()} credit per image`;
  return `${videoCreditBase()} credits per 5s`;
}
