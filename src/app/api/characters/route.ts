import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default(""),
  personaPrompt: z.string().trim().min(1).max(4000),
  visualPrompt: z.string().trim().max(2500).default(""),
  referenceAssetPath: z.string().trim().max(500).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
});
async function identity() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (!profile?.age_verified_at) return { response: NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ verification first." }, { status: 403 }) };
  return { client, admin, user };
}
export async function GET() {
  try {
    const ctx = await identity(); if ("response" in ctx) return ctx.response;
    const { data, error } = await ctx.client.from("characters").select("id,name,description,persona_prompt,visual_prompt,reference_asset_path,tags,created_at,updated_at").eq("user_id", ctx.user.id).order("updated_at", { ascending: false });
    if (error) throw error;
    const rows = await Promise.all((data ?? []).map(async (row) => {
      let referenceUrl: string | null = null;
      if (row.reference_asset_path) {
        const { data: signed } = await ctx.admin.storage.from("lumi-assets").createSignedUrl(row.reference_asset_path, 1800);
        referenceUrl = signed?.signedUrl ?? null;
      }
      return { ...row, referenceUrl };
    }));
    return NextResponse.json({ characters: rows });
  } catch { return NextResponse.json({ error: "Could not load characters." }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const body = schema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "Invalid character details.", details: body.error.flatten() }, { status: 422 });
    const ctx = await identity(); if ("response" in ctx) return ctx.response;
    const path = body.data.referenceAssetPath;
    if (path && (!path.startsWith(ctx.user.id + "/") || path.includes("..") || path.startsWith("/"))) return NextResponse.json({ error: "Reference image must belong to your account." }, { status: 400 });
    const { data, error } = await ctx.client.from("characters").insert({
      user_id: ctx.user.id, name: body.data.name, description: body.data.description,
      persona_prompt: body.data.personaPrompt, visual_prompt: body.data.visualPrompt,
      reference_asset_path: path || null, tags: body.data.tags,
    }).select("id,name,description,persona_prompt,visual_prompt,reference_asset_path,tags,created_at,updated_at").single();
    if (error) throw error;
    return NextResponse.json({ character: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save character." }, { status: 500 }); }
}
