import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function isAtLeast18(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const dob = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(dob.getTime()) || dob.toISOString().slice(0, 10) !== value) return false;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 18 && dob.getTime() <= now.getTime();
}

async function signedInUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

export async function GET() {
  let user;
  try { user = await signedInUser(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("profiles")
      .select("age_verified_at,age_verification_method")
      .eq("id", user.id).single();
    if (error) throw error;
    return NextResponse.json({
      verified: Boolean(data?.age_verified_at),
      verifiedAt: data?.age_verified_at ?? null,
      method: data?.age_verification_method ?? null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not read age-verification status. Apply the latest database migration." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let user;
  try { user = await signedInUser(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  if (!user) return NextResponse.json({ error: "Sign in to verify your age." }, { status: 401 });

  const body = await request.json().catch(() => null) as { dateOfBirth?: unknown; confirm?: unknown } | null;
  if (!body || body.confirm !== true || typeof body.dateOfBirth !== "string") {
    return NextResponse.json({ error: "Enter your date of birth and confirm the declaration." }, { status: 400 });
  }
  if (!isAtLeast18(body.dateOfBirth)) {
    return NextResponse.json({ error: "You must be at least 18 years old to use NEXORA." }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").update({
      age_verified_at: new Date().toISOString(),
      age_verification_method: "self_attested_dob",
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) throw error;
    return NextResponse.json({ verified: true, method: "self_attested_dob" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Age verification could not be saved. Apply the latest database migration and try again." }, { status: 503 });
  }
}
