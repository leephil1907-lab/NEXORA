import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function authenticate(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer ([A-Za-z0-9_-]{40,80})$/.exec(header);
  if (!match) return null;
  const hash = createHash("sha256").update(match[1]).digest("hex");
  const admin = createAdminClient();
  const { data } = await admin.from("local_inference_devices")
    .select("id,user_id,status").eq("token_hash", hash).eq("status", "active").single();
  if (!data) return null;
  return { admin, device: data };
}

export async function GET(request: Request) {
  try {
    const auth = await authenticate(request);
    if (!auth) return NextResponse.json({ error: "Invalid or revoked device token." }, { status: 401 });
    const now = new Date().toISOString();
    await auth.admin.from("local_inference_devices")
      .update({ last_seen_at: now }).eq("id", auth.device.id);
    const { data, error } = await auth.admin.rpc("claim_local_inference_command", {
      p_device_id: auth.device.id, p_user_id: auth.device.user_id,
    });
    if (error) return NextResponse.json({ error: "Could not claim local command." }, { status: 500 });
    const command = Array.isArray(data) ? data[0] : data;
    if (!command) return NextResponse.json({ command: null }, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({
      command: { id: command.id, kind: command.kind, input: command.input, leaseExpiresAt: command.lease_expires_at },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Local agent service is unavailable." }, { status: 503 });
  }
}
