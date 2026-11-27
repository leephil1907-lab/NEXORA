import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const schema = z.object({
  deviceId: z.string().uuid(),
  prompt: z.string().trim().min(1).max(8000),
  systemPrompt: z.string().trim().max(4000).optional(),
  maxTokens: z.number().int().min(16).max(4096).default(512),
  temperature: z.number().min(0).max(2).default(0.7),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid local inference request." }, { status: 422 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to use a local model." }, { status: 401 });
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin.from("profiles")
      .select("age_verified_at").eq("id", user.id).single();
    if (profileError || !profile?.age_verified_at) {
      return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification first." }, { status: 403 });
    }
    const { data: device, error: deviceError } = await admin.from("local_inference_devices")
      .select("id").eq("id", parsed.data.deviceId).eq("user_id", user.id).eq("status", "active").single();
    if (deviceError || !device) return NextResponse.json({ error: "This local device is unavailable or revoked." }, { status: 404 });

    const { data, error } = await admin.from("local_inference_commands").insert({
      user_id: user.id,
      device_id: device.id,
      input: {
        prompt: parsed.data.prompt,
        systemPrompt: parsed.data.systemPrompt ?? "",
        maxTokens: parsed.data.maxTokens,
        temperature: parsed.data.temperature,
      },
    }).select("id,status,created_at,expires_at").single();
    if (error || !data) return NextResponse.json({ error: "Could not queue local inference." }, { status: 500 });
    return NextResponse.json({ request: data }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Local inference service is unavailable." }, { status: 503 });
  }
}
