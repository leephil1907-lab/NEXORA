import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const idSchema = z.string().uuid();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid request ID." }, { status: 400 });
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to view this request." }, { status: 401 });
    const admin = createAdminClient();
    const { data, error } = await admin.from("local_inference_commands")
      .select("id,status,output,error_message,created_at,started_at,completed_at")
      .eq("id", id).eq("user_id", user.id).single();
    if (error || !data) return NextResponse.json({ error: "Local request not found." }, { status: 404 });
    return NextResponse.json({ request: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Local inference service is unavailable." }, { status: 503 });
  }
}
