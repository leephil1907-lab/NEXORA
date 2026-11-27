import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, assistantConfigured, ProviderNotConfiguredError } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 60;

const assistSchema = z.object({
  prompt: z.string().trim().min(1).max(2500),
  mode: z.enum(["enhance", "direct"]).default("enhance"),
});

/**
 * Real prompt-assistant inference against the operator's own GPU endpoint
 * (OpenAI-compatible /v1/chat/completions) — e.g. a llama.cpp server hosting
 * Inkling-2-Mini or Dongfangshuo Qwen3.8. Never a canned response: when the
 * endpoint is not configured this returns an explicit unavailability error.
 */
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = assistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid assistance request." }, { status: 422 });

  if (!assistantConfigured()) {
    return NextResponse.json({
      code: "PROVIDER_NOT_CONFIGURED",
      error: new ProviderNotConfiguredError("custom-llm").message,
    }, { status: 503 });
  }

  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to use the prompt assistant." }, { status: 401 });
  const ageAdmin = createAdminClient();
  const { data: ageProfile, error: ageProfileError } = await ageAdmin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (ageProfileError || !ageProfile?.age_verified_at) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before using the studio." }, { status: 403 });

  try {
    const text = await chatComplete([
      {
        role: "system",
        content:
          "You are a prompt engineer for a photorealistic image and video generation studio. Rewrite the user's idea into a single vivid production prompt: subject, setting, lighting, lens language, motion (if video), mood. Return only the rewritten prompt, no preamble.",
      },
      { role: "user", content: parsed.data.prompt },
    ], 400);
    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json({ code: "PROVIDER_NOT_CONFIGURED", error: error.message }, { status: 503 });
    }
    return NextResponse.json({
      code: "ASSISTANT_FAILED",
      error: error instanceof Error ? error.message : "The prompt assistant request failed.",
    }, { status: 502 });
  }
}
