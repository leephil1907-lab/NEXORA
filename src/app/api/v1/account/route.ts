import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-key-auth";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.admin.from("profiles").select("id,display_name,credits,created_at").eq("id", auth.userId).single();
  if (error || !data) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ account: data });
}
