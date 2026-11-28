import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
const schema = z.object({
  title: z.string().trim().min(1).max(100), category: z.string().trim().max(40).default("Custom"),
  description: z.string().trim().max(500).default(""), prompt: z.string().trim().min(3).max(3000),
  kind: z.enum(["image","video"]).default("image"), modelId: z.string().max(120).optional().nullable(),
  settings: z.record(z.unknown()).default({}),
});
async function context() {
  const client = await createClient(); const { data: { user } } = await client.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const admin = createAdminClient(); const { data } = await admin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (!data?.age_verified_at) return { response: NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ verification first." }, { status: 403 }) };
  return { client, user };
}
export async function GET() {
  try {
    const ctx = await context(); if ("response" in ctx) return ctx.response;
    const { data, error } = await ctx.client.from("creative_cases").select("id,title,category,description,prompt,kind,model_id,settings,is_public,created_at").or("is_public.eq.true,user_id.eq." + ctx.user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ cases: data ?? [] });
  } catch { return NextResponse.json({ error: "Could not load cases." }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid case details.", details: parsed.error.flatten() }, { status: 422 });
    const ctx = await context(); if ("response" in ctx) return ctx.response;
    const d = parsed.data;
    const { data, error } = await ctx.client.from("creative_cases").insert({
      user_id: ctx.user.id, title: d.title, category: d.category, description: d.description,
      prompt: d.prompt, kind: d.kind, model_id: d.modelId || null, settings: d.settings, is_public: false,
    }).select("id,title,category,description,prompt,kind,model_id,settings,created_at").single();
    if (error) throw error;
    return NextResponse.json({ case: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save case." }, { status: 500 }); }
}
