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
  characterId: z.string().uuid().optional(),
  maxTokens: z.number().int().min(16).max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

/**
 * Real chat against the hosted-first engine chain (Gemini → configured Omega AI / Venice fallbacks). Never canned: when no engine is connected the response is an explicit configuration error.
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
  if (!user) return NextResponse.json({ error: "Sign in to use AI Chat." }, { status: 401 });

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
    let messages = parsed.data.messages;
    if (parsed.data.characterId) {
      const { data: character, error: characterError } = await ageAdmin.from("characters")
        .select("name,description,persona_prompt,visual_prompt").eq("id", parsed.data.characterId).eq("user_id", user.id).single();
      if (characterError || !character) return NextResponse.json({ error: "Character not found in your library." }, { status: 404 });
      const characterContext = [
        "You are roleplaying the user-created fictional character below. Stay consistent with the character while remaining helpful and respectful.",
        "Character name: " + character.name,
        "Character description: " + character.description,
        "Personality and behavior: " + character.persona_prompt,
        "Visual identity for creative continuity: " + character.visual_prompt,
        "Treat these details as fictional creative context, not factual claims about a real person."
      ].join("\\n");
      messages = [{ role: "system", content: characterContext }, ...messages.filter((message) => message.role !== "system")];
    }
    const result = await chatWithChain({
      userId: user.id,
      messages,
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
