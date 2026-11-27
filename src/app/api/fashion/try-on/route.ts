import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const API = "https://api.fashn.ai";
type JobRow = {
  id: string; user_id: string; provider_prediction_id: string | null;
  status: "queued" | "processing" | "completed" | "failed";
  model_image_path: string; product_image_path: string; output_path: string | null;
  error_message: string | null;
};

async function account() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function ageAllowed(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("age_verified_at").eq("id", userId).single();
  return !error && Boolean(data?.age_verified_at);
}

function validInputPath(path: unknown, userId: string): path is string {
  return typeof path === "string" && path.startsWith(`${userId}/inputs/`) && !path.includes("..");
}

export async function POST(request: Request) {
  let auth;
  try { auth = await account(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { supabase, user } = auth;
  if (!user) return NextResponse.json({ error: "Sign in to use virtual try-on." }, { status: 401 });
  if (!(await ageAllowed(user.id))) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ age assurance first." }, { status: 403 });
  if (!process.env.FASHN_API_KEY) return NextResponse.json({ code: "PROVIDER_NOT_CONFIGURED", error: "FASHN_API_KEY is not configured. Add it to the NEXORA production environment." }, { status: 503 });

  const body = await request.json().catch(() => null) as { modelImagePath?: unknown; productImagePath?: unknown; consent?: unknown } | null;
  if (!body || body.consent !== true) return NextResponse.json({ error: "Confirm that the person shown is you or an adult who has explicitly agreed to this try-on." }, { status: 428 });
  if (!validInputPath(body.modelImagePath, user.id) || !validInputPath(body.productImagePath, user.id)) {
    return NextResponse.json({ error: "Both uploaded images must belong to your account." }, { status: 400 });
  }

  const admin = createAdminClient();
  const [modelSigned, productSigned] = await Promise.all([
    admin.storage.from("lumi-assets").createSignedUrl(body.modelImagePath, 3600),
    admin.storage.from("lumi-assets").createSignedUrl(body.productImagePath, 3600),
  ]);
  if (modelSigned.error || !modelSigned.data || productSigned.error || !productSigned.data) {
    return NextResponse.json({ error: "One or both uploaded images are unavailable." }, { status: 400 });
  }

  const { data: job, error: insertError } = await admin.from("fashion_jobs").insert({
    user_id: user.id, model_image_path: body.modelImagePath, product_image_path: body.productImagePath, status: "queued",
  }).select("id").single();
  if (insertError || !job) return NextResponse.json({ error: "Could not create the try-on job. Apply the fashion-jobs migration first." }, { status: 503 });

  try {
    const providerResponse = await fetch(`${API}/v1/run`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          model_image: modelSigned.data.signedUrl,
          product_image: productSigned.data.signedUrl,
          resolution: "2k",
          generation_mode: "quality",
          output_format: "png",
          num_images: 1,
        },
      }),
      signal: AbortSignal.timeout(45000),
    });
    const payload = await providerResponse.json().catch(() => ({})) as { id?: string; error?: string; message?: string };
    if (!providerResponse.ok || !payload.id) throw new Error(payload.message || payload.error || `FASHN returned HTTP ${providerResponse.status}.`);
    const { error: updateError } = await admin.from("fashion_jobs").update({
      provider_prediction_id: payload.id, status: "processing", updated_at: new Date().toISOString(),
    }).eq("id", job.id).eq("user_id", user.id);
    if (updateError) throw new Error("Provider accepted the job, but NEXORA could not save its tracking ID.");
    return NextResponse.json({ id: job.id, status: "processing" }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FASHN request failed.";
    await admin.from("fashion_jobs").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", job.id);
    return NextResponse.json({ error: message, jobId: job.id }, { status: 502 });
  }
}

export async function GET(request: Request) {
  let auth;
  try { auth = await account(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { user } = auth;
  if (!user) return NextResponse.json({ error: "Sign in to view this try-on." }, { status: 401 });
  if (!(await ageAllowed(user.id))) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete 18+ age assurance first." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "A job ID is required." }, { status: 400 });

  const admin = createAdminClient();
  const { data: job, error } = await admin.from("fashion_jobs").select("*").eq("id", id).eq("user_id", user.id).single();
  if (error || !job) return NextResponse.json({ error: "Try-on job not found." }, { status: 404 });
  const row = job as JobRow;

  if (row.status === "completed" && row.output_path) {
    const { data } = await admin.storage.from("lumi-assets").createSignedUrl(row.output_path, 3600);
    return NextResponse.json({ id: row.id, status: row.status, outputUrl: data?.signedUrl ?? null });
  }
  if (row.status === "failed") return NextResponse.json({ id: row.id, status: row.status, error: row.error_message });

  if (!row.provider_prediction_id || !process.env.FASHN_API_KEY) {
    return NextResponse.json({ id: row.id, status: row.status });
  }
  try {
    const response = await fetch(`${API}/v1/status/${encodeURIComponent(row.provider_prediction_id)}`, {
      headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const payload = await response.json().catch(() => ({})) as { status?: string; output?: string[]; error?: { message?: string } | string | null };
    if (!response.ok) throw new Error(`FASHN status returned HTTP ${response.status}.`);
    if (payload.status === "failed") {
      const message = typeof payload.error === "string" ? payload.error : payload.error?.message || "FASHN generation failed.";
      await admin.from("fashion_jobs").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", row.id);
      return NextResponse.json({ id: row.id, status: "failed", error: message });
    }
    if (payload.status !== "completed" || !payload.output?.[0]) {
      return NextResponse.json({ id: row.id, status: "processing" });
    }
    const outputUrl = new URL(payload.output[0]);
    if (!["cdn.fashn.ai", "media.fashn.ai"].includes(outputUrl.hostname) || outputUrl.protocol !== "https:") {
      throw new Error("FASHN returned an untrusted output URL.");
    }
    const imageResponse = await fetch(outputUrl, { cache: "no-store", signal: AbortSignal.timeout(30000) });
    if (!imageResponse.ok) throw new Error("Could not retrieve the completed try-on image.");
    const contentType = imageResponse.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) throw new Error("FASHN output was not an image.");
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length < 1 || bytes.length > 30 * 1024 * 1024) throw new Error("Generated image exceeded the storage limit.");
    const outputPath = `${user.id}/outputs/fashion/${row.id}.png`;
    const { error: uploadError } = await admin.storage.from("lumi-assets").upload(outputPath, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw new Error("Could not save the completed image to your private library.");
    const { error: updateError } = await admin.from("fashion_jobs").update({ status: "completed", output_path: outputPath, updated_at: new Date().toISOString() }).eq("id", row.id);
    if (updateError) throw new Error("Image saved but job status could not be updated.");
    const { data: signed } = await admin.storage.from("lumi-assets").createSignedUrl(outputPath, 3600);
    return NextResponse.json({ id: row.id, status: "completed", outputUrl: signed?.signedUrl ?? null });
  } catch (pollError) {
    return NextResponse.json({ id: row.id, status: "processing", error: pollError instanceof Error ? pollError.message : "Status check failed." }, { status: 502 });
  }
}
