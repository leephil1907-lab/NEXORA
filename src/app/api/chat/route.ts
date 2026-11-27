import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chatWithChain, ChatUnavailableError } from "@/lib/chat/chain";

export const runtime = "nodejs";
export const maxDuration = 120;

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().trim().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
  modelId: z.string().trim().max(120).optional(),
  maxTokens: z.number().int().min(16).max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

/**
 * Real chat against the local-first engine chain (Local Companion → self-hosted
 * endpoint → Omega AI → Venice). Never canned: when no engine is connected the
 * response is an explicit configuration error with setup instructions.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid chat request." }, { status: 422 });

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to chat with local models." }, { status: 401 });

  const ageAdmin = createAdminClient();
  const { data: ageProfile, error: ageProfileError } = await ageAdmin
    .from("profiles")
    .select("age_verified_at")
    .eq("id", user.id)
    .single();
  if (ageProfileError || !ageProfile?.age_verified_at) {
    return NextResponse.json(
      { code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification first." },
      { status: 403 }
    );
  }

  try {
    const result = await chatWithChain({
      userId: user.id,
      messages: parsed.data.messages,
      modelId: parsed.data.modelId,
      maxTokens: parsed.data.maxTokens,
      temperature: parsed.data.temperature,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatUnavailableError) {
      return NextResponse.json({ code: error.code, error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      {
        code: "CHAT_FAILED",
        error: error instanceof Error ? error.message : "The chat request failed.",
      },
      { status: 502 }
    );
  }
}
