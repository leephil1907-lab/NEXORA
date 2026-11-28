import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generationRequestSchema } from "@/lib/generations/schema";
import { getModel, startProviderJob, providerReady, ProviderNotConfiguredError } from "@/lib/providers";
import { creditCost, costBreakdown } from "@/lib/generations/pricing";

export const runtime = "nodejs";
export const maxDuration = 60;

const JOB_COLUMNS =
  "id, kind, prompt, aspect_ratio, status, provider_status, error_message, created_at, updated_at, asset_path, asset_mime_type, asset_bytes, model_id, settings, favorite, rating, extended_from, credits_reserved";

function sensitiveEnabled(): boolean {
  const raw = (process.env.NEXORA_ALLOW_SENSITIVE ?? "false").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

export async function GET(request: Request) {
  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to view your generations." }, { status: 401 });
  const ageAdmin = createAdminClient();
  const { data: ageProfile, error: ageProfileError } = await ageAdmin.from("profiles")
    .select("age_verified_at").eq("id", user.id).single();
  if (ageProfileError || !ageProfile?.age_verified_at) {
    return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before using this feature." }, { status: 403 });
  }


  const url = new URL(request.url);
  const limit = Math.min(30, Math.max(1, Number.parseInt(url.searchParams.get("limit") || "12", 10) || 12));
  const filter = url.searchParams.get("filter") || "all";

  let query = supabase.from("generations")
    .select(JOB_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (filter === "images") query = query.eq("kind", "image");
  else if (filter === "videos") query = query.eq("kind", "video");
  else if (filter === "favorites") query = query.eq("favorite", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Could not load generation history." }, { status: 500 });

  const rows = data || [];
  let assetUrls = new Map<string, string>();
  const withAssets = rows.filter((row) => row.asset_path);
  if (withAssets.length > 0) {
    try {
      const admin = createAdminClient();
      const signed = await Promise.all(
        withAssets.map(async (row) => {
          const { data: signedData, error: signError } = await admin.storage
            .from("lumi-assets")
            .createSignedUrl(row.asset_path as string, 3600);
          return signError || !signedData ? null : [row.id, signedData.signedUrl] as const;
        })
      );
      assetUrls = new Map(signed.filter((entry): entry is readonly [string, string] => entry !== null));
    } catch {
      assetUrls = new Map();
    }
  }

  return NextResponse.json({
    generations: rows.map((row) => ({
      ...row,
      assetUrl: row.asset_path ? assetUrls.get(row.id) ?? null : null
    }))
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = generationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation request.", details: parsed.error.flatten() }, { status: 422 });
  }
  const { kind, prompt, settings, referenceAssetPath, endAssetPath, videoAssetPath, extendedFrom, sensitiveConsent } = parsed.data;

  const model = getModel(settings.modelId);
  if (!model) return NextResponse.json({ error: `Unknown model "${settings.modelId}".` }, { status: 400 });
  if (model.modality !== kind) {
    return NextResponse.json({ error: `Model ${model.label} produces ${model.modality}, not ${kind}.` }, { status: 400 });
  }
  if (kind === "video" && model.capabilities.directDuration && !model.durations.includes(settings.durationSeconds)) {
    return NextResponse.json({ error: `${model.label} does not support ${settings.durationSeconds}s clips.` }, { status: 400 });
  }
  if (kind === "video" && settings.durationSeconds === 0) {
    return NextResponse.json({ error: "Video generations need a duration." }, { status: 400 });
  }
  if (!model.capabilities.imageToVideo && !model.capabilities.referenceImage && (referenceAssetPath || endAssetPath)) {
    return NextResponse.json({ error: `${model.label} does not accept reference images.` }, { status: 400 });
  }
  if (!model.capabilities.startEndFrame && endAssetPath) {
    return NextResponse.json({ error: `${model.label} does not accept an end frame.` }, { status: 400 });
  }
  if (!model.capabilities.videoExtend && videoAssetPath) {
    return NextResponse.json({ error: `${model.label} cannot extend an existing clip.` }, { status: 400 });
  }

  // 18+ sensitive content gate — explicit, opt-in, and never simulated.
  if (settings.sensitive) {
    if (!sensitiveEnabled()) {
      return NextResponse.json({
        code: "SENSITIVE_CONTENT_DISABLED",
        error: "Sensitive-content generation is disabled on this deployment (NEXORA_ALLOW_SENSITIVE)."
      }, { status: 403 });
    }
    if (!sensitiveConsent) {
      return NextResponse.json({
        code: "SENSITIVE_CONSENT_REQUIRED",
        error: "Confirm you are 18+ and accept the content rules before running sensitive generations."
      }, { status: 428 });
    }
  }

  if (!providerReady(model)) {
    return NextResponse.json({
      code: "PROVIDER_NOT_CONFIGURED",
      error: new ProviderNotConfiguredError(model.provider).message
    }, { status: 503 });
  }

  let supabase;
  try { supabase = await createClient(); } catch {
    return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to create media." }, { status: 401 });
  const ageAdmin = createAdminClient();
  const { data: ageProfile, error: ageProfileError } = await ageAdmin.from("profiles")
    .select("age_verified_at").eq("id", user.id).single();
  if (ageProfileError || !ageProfile?.age_verified_at) {
    return NextResponse.json({ code: "AGE_VERIFICATION_REQUIRED", error: "Complete NEXORA's 18+ age verification before using this feature." }, { status: 403 });
  }


  const admin = createAdminClient();
  const signInput = async (path: string | undefined): Promise<string | undefined> => {
    if (!path) return undefined;
    if (!path.startsWith(`${user.id}/inputs/`) || path.includes("..")) {
      throw new Error("Reference asset does not belong to this account.");
    }
    const { data, error } = await admin.storage.from("lumi-assets").createSignedUrl(path, 3600);
    if (error || !data) throw new Error("Reference image is missing or unavailable.");
    return data.signedUrl;
  };

  let referenceImageUrl: string | undefined;
  let endImageUrl: string | undefined;
  let videoUrl: string | undefined;
  try {
    referenceImageUrl = await signInput(referenceAssetPath);
    endImageUrl = await signInput(endAssetPath);
    videoUrl = await signInput(videoAssetPath);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid reference asset." }, { status: 400 });
  }

  const costSettings = { ...settings, modality: kind };
  const amount = creditCost(costSettings);
  const { data: job, error: insertError } = await supabase.from("generations")
    .insert({
      user_id: user.id,
      kind,
      prompt,
      aspect_ratio: settings.aspectRatio,
      reference_asset_path: referenceAssetPath || null,
      status: "queued",
      provider: model.provider,
      model_id: model.id,
      settings,
      credits_reserved: amount,
      extended_from: extendedFrom || null,
    })
    .select("id, status, created_at").single();
  if (insertError || !job) return NextResponse.json({ error: "Could not create a generation job." }, { status: 500 });

  const { error: reserveError } = await supabase.rpc("reserve_generation_credits", {
    p_generation_id: job.id, p_amount: amount,
  });
  if (reserveError) {
    await supabase.from("generations").delete().eq("id", job.id);
    const insufficient = reserveError.message.includes("INSUFFICIENT_CREDITS");
    return NextResponse.json({
      error: insufficient ? `You do not have enough credits. This run costs ${amount} (${costBreakdown(costSettings)}).` : "Could not reserve generation credits."
    }, { status: insufficient ? 402 : 500 });
  }

  try {
    const providerJob = await startProviderJob({
      prompt,
      imageUrl: referenceImageUrl,
      endImageUrl,
      videoUrl,
      settings: { ...settings, modality: kind },
    }, model);

    const nextStatus = providerJob.status === "failed" || providerJob.status === "canceled"
      ? "failed"
      : providerJob.status === "succeeded" ? "storage_failed" : "processing";

    const { error: updateError } = await admin.from("generations").update({
      provider_prediction_id: providerJob.providerJobId,
      provider_status: providerJob.status,
      status: nextStatus,
      provider_output: providerJob.outputUrl ? { url: providerJob.outputUrl } : null,
      error_message: providerJob.error ?? null,
      updated_at: new Date().toISOString(),
    }).eq("id", job.id).eq("user_id", user.id);
    if (updateError) {
      throw new Error("The provider accepted the request but the job state could not be saved. Contact support with job ID " + job.id);
    }

    if (nextStatus === "failed") {
      await admin.rpc("refund_generation_credits", {
        p_user_id: user.id, p_generation_id: job.id, p_amount: amount, p_reason: "provider_failed_on_submit",
      });
    }
    return NextResponse.json({ id: job.id, status: nextStatus, providerStatus: providerJob.status }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The provider request failed.";
    const isUnconfigured = error instanceof ProviderNotConfiguredError;
    try {
      const admin2 = createAdminClient();
      await admin2.from("generations").update({
        status: "failed", error_message: message, updated_at: new Date().toISOString(),
      }).eq("id", job.id).eq("user_id", user.id);
      await admin2.rpc("refund_generation_credits", {
        p_user_id: user.id, p_generation_id: job.id, p_amount: amount, p_reason: "provider_submission_failed",
      });
    } catch {
      // Preserve the original provider error; an operator can reconcile a failed refund from the ledger.
    }
    return NextResponse.json({
      code: isUnconfigured ? "PROVIDER_NOT_CONFIGURED" : "PROVIDER_REQUEST_FAILED",
      error: message,
      jobId: job.id,
    }, { status: isUnconfigured ? 503 : 502 });
  }
}
