import { NextResponse } from "next/server";
import type { AppConfig } from "@/lib/generations/types";
import { publicCatalog, getModel, providerReady, assistantConfigured, customImageConfigured, replicateConfigured } from "@/lib/providers";
import { imageCreditCost, videoCreditBase, maxUploadMb } from "@/lib/generations/pricing";

export const runtime = "nodejs";

function sensitiveEnabled(): boolean {
  const raw = (process.env.NEXORA_ALLOW_SENSITIVE ?? "false").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

/**
 * Public, non-secret runtime configuration: the real model catalog with live
 * availability, the credit economy, and which subsystems are configured.
 * No credentials ever leave the server.
 */
export async function GET() {
  const models = publicCatalog().map((m) => ({
    ...m,
    ready: (() => {
      const entry = getModel(m.id);
      return entry ? providerReady(entry) : false;
    })(),
  }));

  const config: AppConfig & { models: typeof models } = {
    authEnabled: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    generationEnabled: models.some((m) => m.ready),
    assistantEnabled: assistantConfigured(),
    sensitiveEnabled: sensitiveEnabled(),
    imageCreditCost: imageCreditCost(),
    videoCreditCost: videoCreditBase(),
    maxUploadMb: maxUploadMb(),
    models,
  };
  return NextResponse.json({
    ...config,
    providers: {
      replicate: replicateConfigured(),
      customImage: customImageConfigured(),
      customLlm: assistantConfigured(),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
