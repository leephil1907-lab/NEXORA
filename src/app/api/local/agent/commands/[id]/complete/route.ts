import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const idSchema = z.string().uuid();
const resultSchema = z.object({
  output: z.string().max(50000).optional(),
  error: z.string().trim().min(1).max(1000).optional(),
}).refine((value) => Boolean(value.output) !== Boolean(value.error), {
  message: "Provide exactly one of output or error.",
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid command ID." }, { status: 400 });
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer ([A-Za-z0-9_-]{40,80})$/.exec(header);
  if (!match) return NextResponse.json({ error: "Device authentication required." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid completion payload." }, { status: 422 });
  try {
    const admin = createAdminClient();
    const tokenHash = createHash("sha256").update(match[1]).digest("hex");
    const { data: device } = await admin.from("local_inference_devices")
      .select("id,user_id").eq("token_hash", tokenHash).eq("status", "active").single();
    if (!device) return NextResponse.json({ error: "Invalid or revoked device token." }, { status: 401 });

    const update = parsed.data.error
      ? { status: "failed", error_message: parsed.data.error, completed_at: new Date().toISOString(), lease_expires_at: null }
      : { status: "completed", output: parsed.data.output, completed_at: new Date().toISOString(), lease_expires_at: null };
    const { data, error } = await admin.from("local_inference_commands")
      .update(update).eq("id", id).eq("device_id", device.id).eq("user_id", device.user_id).eq("status", "running")
      .select("id,status").single();
    if (error || !data) return NextResponse.json({ error: "Command is not active for this device." }, { status: 409 });
    return NextResponse.json({ command: data });
  } catch {
    return NextResponse.json({ error: "Could not submit local inference result." }, { status: 503 });
  }
}
