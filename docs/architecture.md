# NEXORA architecture

## Boundaries
NEXORA is an independent product. It must not import unrelated application code, share credentials, or depend on another product's database. Integrations happen through documented APIs and explicit identity/entitlement mapping.

## Request lifecycle
1. An authenticated user submits a generation request.
2. The server validates the request and checks available credits.
3. A generation record is created with status `queued`.
4. A provider adapter submits a real inference request.
5. The provider prediction ID and state are persisted.
6. The client reads persisted job state; it never fabricates progress.
7. Provider outputs are copied to private object storage before being labelled as stored assets.
8. Failure details are persisted and reserved credits are refunded idempotently.

## Core modules
- `src/lib/supabase`: browser/server Supabase clients
- `src/lib/providers`: provider-neutral contracts and provider adapters
- `src/app/api/generations`: authenticated generation and status APIs
- `src/app/studio`: customer workspace
- `supabase/migrations`: schema, RLS, credit ledger and RPC functions

## Fashion pipeline boundary
Fashion tools are separate inference workflows, not aliases for the image/video generator:
- Garment extraction: isolate a garment from a clothed reference photo and produce a product-style garment image.
- Garment segmentation: return masks/regions for tops, bottoms, dresses and accessories.
- Virtual try-on: apply a supplied garment image to a person image, with explicit image-owner/subject consent.
- Garment replacement: a try-on/edit workflow that uses a supplied replacement garment.
- Video generation: animate an image or generate a clip using the Wan/LTX provider adapters.

The Hugging Face `Xabsurd/Clothing-Extractor` adapter is based on `Qwen/Qwen-Image-Edit-2511` plus a LoRA. It requires a dedicated compatible GPU worker that loads both the base model and adapter. The model is not currently deployed by a Hugging Face Inference Provider; do not wire it as though a standard hosted inference URL exists. The worker must expose an authenticated, asynchronous job API and return a durable output URL. Keep its GPU credentials server-side.

## Security
- Provider tokens and service-role keys are server-only.
- User-owned rows use Row Level Security.
- API routes verify the authenticated user on every request.
- Credit operations are transactional and idempotent.
- Admin permissions are checked server-side.
- Uploads have size/type limits and private storage policies.
- Webhook signatures must be verified before they can mutate jobs.
- Fashion workflows must verify ownership/authorization for uploaded person and garment assets and must not generate non-consensual intimate imagery.

## Reliability
- Provider errors are explicit, never replaced with successful placeholder results.
- Jobs are durable and survive browser refresh.
- Model identifiers are environment-configured and validated.
- Timeouts, retries and rate limits are bounded.
- A job is complete only after provider completion is confirmed.
