import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
const schema = z.object({ name: z.string().trim().min(1).max(80), expiresInDays: z.number().int().min(1).max(365).nullable().optional() });
async function context() {
  const client = await createClient(); const { data: { user } } = await client.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  const admin = createAdminClient(); const { data } = await admin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (!data?.age_verified_at) return { response: NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ verification first." }, { status: 403 }) };
  return { client, admin, user };
}
export async function GET() {
  try {
    const ctx = await context(); if ("response" in ctx) return ctx.response;
    const { data, error } = await ctx.admin.from("api_keys").select("id,name,key_prefix,last_used_at,expires_at,revoked_at,created_at").eq("user_id", ctx.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ keys: data ?? [] });
  } catch { return NextResponse.json({ error: "Could not load API keys." }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid API key settings." }, { status: 422 });
    const ctx = await context(); if ("response" in ctx) return ctx.response;
    const token = "nex_live_" + randomBytes(32).toString("hex");
    const expiresAt = parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 86400000).toISOString() : null;
    const { data, error } = await ctx.admin.from("api_keys").insert({
      user_id: ctx.user.id, name: parsed.data.name, key_prefix: token.slice(0, 17),
      token_hash: createHash("sha256").update(token).digest("hex"), expires_at: expiresAt,
    }).select("id,name,key_prefix,expires_at,created_at").single();
    if (error) throw error;
    return NextResponse.json({ key: data, secret: token }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not create API key." }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Key ID is required." }, { status: 400 });
    const ctx = await context(); if ("response" in ctx) return ctx.response;
    const { error } = await ctx.admin.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id).eq("user_id", ctx.user.id).is("revoked_at", null);
    if (error) throw error;
    return NextResponse.json({ revoked: true });
  } catch { return NextResponse.json({ error: "Could not revoke API key." }, { status: 500 }); }
}
