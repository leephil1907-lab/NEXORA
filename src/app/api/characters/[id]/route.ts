import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  personaPrompt: z.string().trim().min(1).max(4000).optional(),
  visualPrompt: z.string().trim().max(2500).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).optional(),
});
async function owner() {
  const client = await createClient(); const { data: { user } } = await client.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const admin = createAdminClient(); const { data } = await admin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (!data?.age_verified_at) return { response: NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ verification first." }, { status: 403 }) };
  return { client, user };
}
export async function PATCH(request: Request, context: Ctx) {
  try {
    const { id } = await context.params; const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid character update." }, { status: 422 });
    const ctx = await owner(); if ("response" in ctx) return ctx.response;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.name !== undefined) patch.name = parsed.data.name;
    if (parsed.data.description !== undefined) patch.description = parsed.data.description;
    if (parsed.data.personaPrompt !== undefined) patch.persona_prompt = parsed.data.personaPrompt;
    if (parsed.data.visualPrompt !== undefined) patch.visual_prompt = parsed.data.visualPrompt;
    if (parsed.data.tags !== undefined) patch.tags = parsed.data.tags;
    const { data, error } = await ctx.client.from("characters").update(patch).eq("id", id).eq("user_id", ctx.user.id).select("id,name,description,persona_prompt,visual_prompt,tags,updated_at").single();
    if (error || !data) return NextResponse.json({ error: "Character not found." }, { status: 404 });
    return NextResponse.json({ character: data });
  } catch { return NextResponse.json({ error: "Could not update character." }, { status: 500 }); }
}
export async function DELETE(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params; const ctx = await owner(); if ("response" in ctx) return ctx.response;
    const { error, count } = await ctx.client.from("characters").delete({ count: "exact" }).eq("id", id).eq("user_id", ctx.user.id);
    if (error) throw error;
    return NextResponse.json({ deleted: (count ?? 0) > 0 });
  } catch { return NextResponse.json({ error: "Could not delete character." }, { status: 500 }); }
}
