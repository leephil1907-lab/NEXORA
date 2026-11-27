import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const idSchema = z.string().uuid();

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid device ID." }, { status: 400 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to revoke a device." }, { status: 401 });
    const admin = createAdminClient();
    const { error } = await admin.from("local_inference_devices")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", id).eq("user_id", user.id).eq("status", "active");
    if (error) return NextResponse.json({ error: "Could not revoke device." }, { status: 500 });
    await admin.from("local_inference_commands")
      .update({ status: "expired", completed_at: new Date().toISOString(), error_message: "Device was revoked." })
      .eq("device_id", id).in("status", ["queued", "running"]);
    return NextResponse.json({ revoked: true });
  } catch {
    return NextResponse.json({ error: "Local device service is unavailable." }, { status: 503 });
  }
}
