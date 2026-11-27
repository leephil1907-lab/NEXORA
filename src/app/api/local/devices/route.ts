import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  platform: z.enum(["android", "linux", "windows", "macos", "other"]).default("android"),
});

async function getVerifiedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: "Sign in to manage local devices.", status: 401 };
  const admin = createAdminClient();
  const { data: profile, error } = await admin.from("profiles")
    .select("age_verified_at").eq("id", user.id).single();
  if (error || !profile?.age_verified_at) {
    return { user: null, error: "Complete NEXORA's 18+ age verification first.", status: 403 };
  }
  return { user, error: null, status: 200 };
}

export async function GET() {
  try {
    const auth = await getVerifiedUser();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = createAdminClient();
    const { data, error } = await admin.from("local_inference_devices")
      .select("id,name,platform,status,last_seen_at,created_at,revoked_at")
      .eq("user_id", auth.user.id).order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "Could not load local devices." }, { status: 500 });
    return NextResponse.json({ devices: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Local device service is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid device details." }, { status: 422 });
  try {
    const auth = await getVerifiedUser();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = createAdminClient();
    const { count, error: countError } = await admin.from("local_inference_devices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id).eq("status", "active");
    if (countError) return NextResponse.json({ error: "Could not validate device limit." }, { status: 500 });
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "A maximum of five active local devices is allowed." }, { status: 409 });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await admin.from("local_inference_devices").insert({
      user_id: auth.user.id, name: parsed.data.name, platform: parsed.data.platform, token_hash: tokenHash,
    }).select("id,name,platform,status,created_at").single();
    if (error || !data) return NextResponse.json({ error: "Could not register this device." }, { status: 500 });
    return NextResponse.json({
      device: data,
      token,
      warning: "Copy this token now. It is shown only once; revoke the device if it is lost.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Local device service is unavailable." }, { status: 503 });
  }
}
