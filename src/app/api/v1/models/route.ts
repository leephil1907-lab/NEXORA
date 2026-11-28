import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-key-auth";
import { publicCatalog, getModel, providerReady } from "@/lib/providers";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const models = publicCatalog().filter((model) => { const entry = getModel(model.id); return entry ? providerReady(entry) : false; });
  return NextResponse.json({ models }, { headers: { "Cache-Control": "no-store" } });
}
