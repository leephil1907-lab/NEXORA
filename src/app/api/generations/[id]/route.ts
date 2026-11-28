import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generationIdSchema, generationPatchSchema } from "@/lib/generations/schema";
import { getModel, pollProviderJob } from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
async function hasAgeAssurance(userId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("profiles")
      .select("age_verified_at").eq("id", userId).single();
    return !error && Boolean(data?.age_verified_at);
  } catch {
    return false;
  }
}


function outputUrl(value: unknown): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === "string") return candidate;
  if (candidate && typeof candidate === "object") {
    const record = candidate as Record<string, unknown>;
    for (const key of ["url", "video", "image", "output"]) {
      if (typeof record[key] === "string") return record[key] as string;
    }
  }
  return null;
}

function trustedSource(source: string): { ok: boolean; bytes?: Buffer; mime?: string } {
  if (source.startsWith("data:")) {
    const match = /^data:([a-z0-9/+.-]+);base64,(.+)$/i.exec(source);
    if (!match) return { ok: false };
    return { ok: true, bytes: Buffer.from(match[2], "base64"), mime: match[1].toLowerCase() };
  }
  try {
    const parsed = new URL(source);
    const customHosts = [process.env.NEXORA_IMAGE_ENDPOINT, process.env.NEXORA_LLM_ENDPOINT]
      .filter(Boolean)
      .map((u) => { try { return new URL(u as string).hostname; } catch { return ""; } })
      .filter(Boolean);
    const ok =
      parsed.protocol === "https:" &&
      (parsed.hostname === "replicate.delivery" ||
        parsed.hostname.endsWith(".replicate.delivery") ||
        parsed.hostname === "generativelanguage.googleapis.com" ||
        customHosts.includes(parsed.hostname));
    return { ok };
  } catch {
    return { ok: false };
  }
}

async function storeOutput(userId: string, jobId: string, kind: "image" | "video", output: unknown) {
  const source = outputUrl(output);
  if (!source) throw new Error("Provider reported success but returned no downloadable media URL.");
  const trusted = trustedSource(source);
  if (!trusted.ok) throw new Error("Provider output URL failed the trusted-host check.");

  let buffer: Buffer;
  let mime: string;
  if (trusted.bytes && trusted.mime) {
    buffer = trusted.bytes;
    mime = trusted.mime;
  } else {
    const sourceHost = new URL(source).hostname;
    const response = await fetch(source, {
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(45_000),
      ...(sourceHost === "generativelanguage.googleapis.com"
        ? { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY || "" } }
        : {}),
    });
    if (response.status >= 300 && response.status < 400) throw new Error("Provider output attempted an unexpected redirect.");
    if (!response.ok) throw new Error(`Could not retrieve provider output (HTTP ${response.status}).`);
    mime = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    const maxBytes = kind === "image" ? 40 * 1024 * 1024 : 200 * 1024 * 1024;
    const declaredSize = Number(response.headers.get("content-length") || "0");
    if (declaredSize > maxBytes) throw new Error("Generated media exceeds the configured storage size limit.");
    buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > maxBytes) throw new Error("Generated media exceeds the configured storage size limit.");
  }

  const allowed = kind === "image"
    ? ["image/png", "image/jpeg", "image/webp"]
    : ["video/mp4", "video/webm", "video/quicktime"];
  if (!allowed.includes(mime)) throw new Error(`Provider returned an unsupported media type: ${mime || "unknown"}.`);

  const validImage = mime === "image/png"
    ? buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    : mime === "image/jpeg" ? buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    : mime === "image/webp" ? buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" : false;
  const validVideo = mime === "video/webm"
    ? buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))
    : (mime === "video/mp4" || mime === "video/quicktime") && buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp";
  if (kind === "image" ? !validImage : !validVideo) throw new Error("Generated media bytes do not match the provider's declared media type.");

  const extension = mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "video/webm" ? "webm" : mime === "video/quicktime" ? "mov" : "mp4";
  const path = `${userId}/${jobId}/original.${extension}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from("lumi-assets").upload(path, buffer, { contentType: mime, upsert: true });
  if (uploadError) throw new Error(`Media storage failed: ${uploadError.message}`);
  return { path, mime, bytes: buffer.byteLength };
}

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!generationIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid generation ID." }, { status: 400 });

  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view this generation." }, { status: 401 });
  if (!(await hasAgeAssurance(user.id))) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before using the studio." }, { status: 403 });

  const { data: job, error } = await supabase.from("generations")
    .select("id,user_id,kind,prompt,aspect_ratio,status,provider_status,provider_prediction_id,provider_output,error_message,created_at,updated_at,asset_path,asset_mime_type,asset_bytes,credits_reserved,model_id,settings,favorite,rating,extended_from")
    .eq("id", id).eq("user_id", user.id).single();
  if (error || !job) return NextResponse.json({ error: "Generation not found." }, { status: 404 });

  let current = job;
  const model = job.model_id ? getModel(job.model_id) : undefined;
  if (job.provider_prediction_id && model && ["queued", "processing", "storage_failed"].includes(job.status)) {
    try {
      const providerJob = await pollProviderJob(job.provider_prediction_id, model);
      const admin = createAdminClient();
      const nextStatus = providerJob.status === "failed" || providerJob.status === "canceled"
        ? "failed"
        : providerJob.status === "succeeded" ? "storage_failed" : "processing";

      const { error: stateError } = await admin.from("generations").update({
        provider_status: providerJob.status,
        status: nextStatus,
        provider_output: providerJob.outputUrl ? { url: providerJob.outputUrl } : job.provider_output,
        error_message: providerJob.error ?? null,
        updated_at: new Date().toISOString(),
      }).eq("id", id).eq("user_id", user.id);
      if (stateError) throw new Error("Could not persist provider status.");

      current = {
        ...job,
        provider_status: providerJob.status,
        status: nextStatus,
        error_message: providerJob.error ?? null,
      };

      if (nextStatus === "failed") {
        const { error: refundError } = await admin.rpc("refund_generation_credits", {
          p_user_id: user.id, p_generation_id: id, p_amount: job.credits_reserved, p_reason: "provider_generation_failed",
        });
        if (refundError && !refundError.message.includes("already")) {
          throw new Error("Generation failed and credit reconciliation needs support review.");
        }
      } else if (providerJob.status === "succeeded") {
        try {
          const stored = await storeOutput(user.id, id, job.kind, providerJob.outputUrl ?? job.provider_output);
          const { error: assetError } = await admin.from("generations").update({
            status: "succeeded", provider_output: null, asset_path: stored.path, asset_mime_type: stored.mime,
            asset_bytes: stored.bytes, error_message: null, updated_at: new Date().toISOString(),
          }).eq("id", id).eq("user_id", user.id);
          if (assetError) throw new Error("Media was uploaded but the asset record could not be saved.");
          current = {
            ...current, status: "succeeded", asset_path: stored.path,
            asset_mime_type: stored.mime, asset_bytes: stored.bytes, error_message: null,
          };
        } catch (storageError) {
          const reason = storageError instanceof Error ? storageError.message : "Could not persist generated media.";
          await admin.from("generations").update({
            status: "storage_failed", error_message: reason, updated_at: new Date().toISOString(),
          }).eq("id", id).eq("user_id", user.id);
          current = { ...current, status: "storage_failed", error_message: reason };
        }
      }
    } catch (pollError) {
      return NextResponse.json({
        error: pollError instanceof Error ? pollError.message : "Could not check provider status.",
        jobId: id,
      }, { status: 502 });
    }
  }

  let assetUrl: string | null = null;
  if (current.asset_path) {
    try {
      const admin = createAdminClient();
      const { data, error: signedError } = await admin.storage.from("lumi-assets").createSignedUrl(current.asset_path, 3600);
      if (!signedError) assetUrl = data.signedUrl;
    } catch {
      assetUrl = null;
    }
  }

  const { provider_output: _providerOutput, provider_prediction_id: _predictionId, user_id: _userId, ...safeJob } = current;
  return NextResponse.json({ ...safeJob, assetUrl });
}

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  if (!generationIdSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid generation ID." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = generationPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid update.", details: parsed.error.flatten() }, { status: 422 });

  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to update this generation." }, { status: 401 });
  if (!(await hasAgeAssurance(user.id))) return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before using the studio." }, { status: 403 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.favorite !== undefined) patch.favorite = parsed.data.favorite;
  if (parsed.data.rating !== undefined) patch.rating = parsed.data.rating;

  const { data, error } = await supabase.from("generations")
    .update(patch)
    .eq("id", id).eq("user_id", user.id)
    .select("id, favorite, rating")
    .single();
  if (error || !data) return NextResponse.json({ error: "Generation not found." }, { status: 404 });
  return NextResponse.json(data);
}
