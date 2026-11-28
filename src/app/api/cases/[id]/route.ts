import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };
export async function DELETE(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params; const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { error, count } = await client.from("creative_cases").delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ deleted: (count ?? 0) > 0 });
  } catch { return NextResponse.json({ error: "Could not delete case." }, { status: 500 }); }
}
