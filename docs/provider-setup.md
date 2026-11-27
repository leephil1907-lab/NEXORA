# Provider setup

## Replicate
NEXORA's video and image adapters use the Replicate HTTP API. Configure this server-side variable:
- `REPLICATE_API_TOKEN`: Replicate API token.

The model catalog in `src/lib/providers/catalog.ts` contains the model identifiers and capabilities. Availability, input schemas, dimensions, durations and pricing vary by model. Verify each model's current published input schema before enabling it. A missing token must produce `PROVIDER_NOT_CONFIGURED`. Never return fabricated media.

## Custom OpenAI-compatible backends
- `NEXORA_LLM_ENDPOINT`: base URL for a `/v1/chat/completions` endpoint.
- `NEXORA_LLM_API_KEY`: optional bearer token.
- `NEXORA_LLM_MODEL`: model name sent to the endpoint.
- `NEXORA_IMAGE_ENDPOINT`: base URL for a `/v1/images/generations` endpoint.
- `NEXORA_IMAGE_API_KEY`: optional bearer token.
- `NEXORA_IMAGE_MODEL`: model name sent to the endpoint.

These are distinct from the clothing-extraction pipeline below.

## Hugging Face clothing extraction
Model: [Xabsurd/Clothing-Extractor](https://huggingface.co/Xabsurd/Clothing-Extractor)

This is a LoRA adapter for `Qwen/Qwen-Image-Edit-2511`, not a standalone model server. Its model card demonstrates loading the base Diffusers pipeline and then loading the LoRA weights. Hugging Face currently reports no hosted Inference Provider for this adapter.

A dedicated GPU worker must:
1. Load `Qwen/Qwen-Image-Edit-2511` and the `Xabsurd/Clothing-Extractor` LoRA.
2. Accept an authenticated image reference and extraction category (full outfit, upper-body garment, lower-body garment, or bag).
3. Run the model with the model-card extraction instruction.
4. Persist the output to private object storage and return a durable job ID/status/output reference.
5. Enforce request size limits, per-user isolation, timeouts and bounded concurrency.

Do not point `NEXORA_IMAGE_ENDPOINT` at this LoRA: the current generic image adapter only supports text-to-image and does not submit a reference image. The clothing worker needs its own adapter and API contract. Do not mark the feature ready until a real GPU smoke test completes.

## Production virtual try-on (FASHN)
NEXORA includes a dedicated, account-scoped clothing try-on route at `/api/fashion/try-on` and a studio screen at `/studio/try-on`.

Configure this server-side secret in Render:
- `FASHN_API_KEY`: API key from the [FASHN Developer API dashboard](https://app.fashn.ai/).

The adapter calls `POST https://api.fashn.ai/v1/run` with `model_name: tryon-max`, then polls `GET /v1/status/{id}`. It accepts signed private Supabase image URLs, requires an explicit adult-subject consent declaration, checks that both assets belong to the signed-in account, and copies completed output into the private `lumi-assets` bucket so NEXORA does not depend on FASHN's expiring CDN links. It requests 2K quality output. FASHN charges its own API credits; NEXORA's existing generation-credit ledger is not currently applied to this separate try-on workflow.

Before enabling the feature, apply `202611270002_fashion_jobs.sql` and verify that the Supabase `lumi-assets` bucket exists and is private. FASHN requires its own prepaid API credits and key. If `FASHN_API_KEY` is absent, the route returns `PROVIDER_NOT_CONFIGURED` and does not fabricate an output.

This workflow is intentionally limited to ordinary clothing and accessories. It is not an undressing, intimate-image, or sexualized face-swap feature. Users must have the pictured adult's explicit permission.

## Launch gate
Run a real generation smoke test for every enabled model and modality before advertising it as available. Record model version, settings, prediction/job ID, output dimensions/duration and stored asset URL.
