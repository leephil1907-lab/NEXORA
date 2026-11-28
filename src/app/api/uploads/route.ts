import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export async function GET(request: Request) {
  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to load this reference image." }, { status: 401 });
  const admin = createAdminClient();
  const { data: ageProfile, error: ageError } = await admin.from("profiles")
    .select("age_verified_at").eq("id", user.id).single();
  if (ageError || !ageProfile?.age_verified_at) {
    return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ verification first." }, { status: 403 });
  }
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!path.startsWith(`${user.id}/`) || path.includes("..") || path.startsWith("/") || path.includes("\\")) {
    return NextResponse.json({ error: "Reference asset path is invalid." }, { status: 400 });
  }
  const { data, error } = await admin.storage.from("lumi-assets").createSignedUrl(path, 3600);
  if (error || !data) return NextResponse.json({ error: "Reference image is unavailable." }, { status: 404 });
  return NextResponse.json({ path, signedUrl: data.signedUrl });
}

export async function POST(request: Request) {
  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in before uploading a reference image." }, { status: 401 });
  const ageAdmin = createAdminClient();
  const { data: ageProfile, error: ageProfileError } = await ageAdmin.from("profiles").select("age_verified_at").eq("id", user.id).single();
  if (ageProfileError || !ageProfile?.age_verified_at) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before uploading media." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  const extension = allowedTypes[file.type];
  if (!extension) return NextResponse.json({ error: "Only JPEG, PNG and WebP images are supported." }, { status: 415 });

  const maxMb = Math.max(1, Math.min(25, Number.parseInt(process.env.NEXORA_MAX_UPLOAD_MB || "20", 10) || 20));
  if (file.size < 1 || file.size > maxMb * 1024 * 1024) {
    return NextResponse.json({ error: `Reference images must be smaller than ${maxMb} MB.` }, { status: 413 });
  }

  const path = `${user.id}/inputs/${randomUUID()}.${extension}`;
  try {
    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const isJpeg = file.type === "image/jpeg" && buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = file.type === "image/png" && buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const isWebp = file.type === "image/webp" && buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ error: "The uploaded file contents do not match a supported image format." }, { status: 415 });
    }
    const { error } = await admin.storage.from("lumi-assets").upload(path, buffer, {
      contentType: file.type,
      upsert: false
    });
    if (error) throw new Error(error.message);
    const { data, error: signError } = await admin.storage.from("lumi-assets").createSignedUrl(path, 3600);
    if (signError || !data) throw new Error(signError?.message || "Could not create a secure media URL.");
    return NextResponse.json({ path, signedUrl: data.signedUrl, name: file.name, size: file.size }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Reference upload failed." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage reference uploads." }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { path?: string };
  const path = body.path || "";
  if (!path.startsWith(`${user.id}/inputs/`) || path.includes("..")) {
    return NextResponse.json({ error: "Reference asset path is invalid." }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.storage.from("lumi-assets").remove([path]);
  if (error) return NextResponse.json({ error: "Could not remove the reference image." }, { status: 500 });
  return NextResponse.json({ removed: true });
}
