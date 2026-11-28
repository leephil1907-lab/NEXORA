import { customImageProvider, assistantConfigured, customImageConfigured, chatComplete } from "./custom";
import { geminiImageProvider, geminiVideoProvider } from "./gemini";
import { getModel, MODEL_CATALOG, ASSISTANT_CATALOG, publicCatalog } from "./catalog";
import type { GenerationProvider, ModelEntry, ProviderJob, StartJobArgs, ProviderJobStatus } from "./types";
import { ProviderNotConfiguredError } from "./types";

export {
  getModel,
  MODEL_CATALOG,
  ASSISTANT_CATALOG,
  publicCatalog,
  assistantConfigured,
  customImageConfigured,
  chatComplete,
  ProviderNotConfiguredError,
};
export type { ModelEntry, ProviderJob, StartJobArgs, ProviderJobStatus };

export function geminiConfigured(): boolean { return Boolean(process.env.GEMINI_API_KEY); }

export function providerFor(model: ModelEntry): GenerationProvider {
  switch (model.provider) {
    case "custom-image":
      return customImageProvider;
    case "gemini-image":
      return geminiImageProvider;
    case "gemini-video":
      return geminiVideoProvider;
    default:
      throw new ProviderNotConfiguredError(model.provider);
  }
}

export function providerReady(model: ModelEntry): boolean {
  switch (model.provider) {
    case "custom-image":
      return customImageConfigured();
    case "gemini-image":
    case "gemini-video":
      return geminiConfigured();
    default:
      return false;
  }
}

export async function startProviderJob(args: StartJobArgs, model: ModelEntry): Promise<ProviderJob> {
  return providerFor(model).start(args, model);
}

export async function pollProviderJob(providerJobId: string, model: ModelEntry): Promise<ProviderJob> {
  return providerFor(model).get(providerJobId, model);
}
