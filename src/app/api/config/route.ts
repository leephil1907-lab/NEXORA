import { NextResponse } from "next/server";
import type { AppConfig } from "@/lib/generations/types";
import { publicCatalog, getModel, providerReady, replicateConfigured, geminiConfigured } from "@/lib/providers";
import { imageCreditCost, videoCreditBase, maxUploadMb } from "@/lib/generations/pricing";
import { omegaConfigured } from "@/lib/providers/omega";

export const runtime = "nodejs";

function sensitiveEnabled(): boolean {
  const raw = (process.env.NEXORA_ALLOW_SENSITIVE ?? "false").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/** Only advertise models whose provider is actually configured on this deployment. */
export async function GET() {
  const models = publicCatalog()
    .map((model) => {
      const entry = getModel(model.id);
      return { ...model, ready: entry ? providerReady(entry) : false };
    })
    .filter((model) => model.ready);

  const chatReady = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.VENICE_API_KEY ||
    omegaConfigured()
  );

  const config: AppConfig & { models: typeof models } = {
    authEnabled: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    generationEnabled: models.length > 0,
    assistantEnabled: chatReady,
    sensitiveEnabled: sensitiveEnabled(),
    imageCreditCost: imageCreditCost(),
    videoCreditCost: videoCreditBase(),
    maxUploadMb: maxUploadMb(),
    models,
  };

  const llmCatalog = chatReady
    ? [{ id: "auto", label: "Automatic · hosted AI" }]
    : [];

  return NextResponse.json({
    ...config,
    providers: {
      replicate: false,
      gemini: geminiConfigured(),
      omega: omegaConfigured(),
      venice: Boolean(process.env.VENICE_API_KEY),
    },
    engines: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      omega: omegaConfigured(),
      venice: Boolean(process.env.VENICE_API_KEY),
      replicate: false,
      geminiImage: geminiConfigured(),
      geminiVideo: geminiConfigured(),
    },
    llmCatalog,
  }, { headers: { "Cache-Control": "no-store" } });
}
