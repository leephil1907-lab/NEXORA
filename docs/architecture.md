# NEXORA architecture

## Boundaries

NEXORA is an independent product. It must not import unrelated application code, share credentials, or depend on another product's database. Integrations happen through documented APIs and explicit identity/entitlement mapping.

## Request lifecycle

1. An authenticated user submits a generation request.
2. The server validates the request and checks available credits.
3. A generation record is created with status queued.
4. The Gemini provider adapter submits a real inference request.
5. The provider interaction/job ID and state are persisted.
6. The client reads persisted job state; it never fabricates progress.
7. Provider outputs are copied to private object storage before being labelled as stored assets.
8. Failure details are persisted and reserved credits are refunded idempotently.

## Core modules

- src/lib/supabase: browser/server Supabase clients
- src/lib/providers: provider-neutral contracts and Gemini adapters
- src/app/api/generations: authenticated generation and status APIs
- src/app/studio: customer workspace
- src/app/tools: dedicated image and video workflows
- supabase/migrations: schema, RLS, credit ledger and RPC functions

## Active generation engines

- Gemini 3.1 Flash Lite Image: text-to-image and reference-image editing.
- Gemini Omni 1.2 Flash: text-to-video and image-to-video.

The active public catalog does not route image or video generation to Replicate. Specialized image tools are prompt presets over the configured Gemini image-editing workflow. Video tasks are polled through the Interactions API and completed media is downloaded from Google Files API before being copied to private storage.

## Fashion and character workflows

Character profiles are private to their owner and can store a reference image. The character's visual brief can be used to start an image-editing workflow with that reference.

Fashion & Design Studio is a Gemini prompt-guided creative tool. It does not advertise a separate virtual try-on or garment-segmentation engine as part of the active creative catalog.

## Security

- Provider tokens and service-role keys are server-only.
- User-owned rows use Row Level Security.
- API routes verify the authenticated user on every request.
- Credit operations are transactional and idempotent.
- Admin permissions are checked server-side.
- Uploads have size/type limits and private storage policies.
- Provider output URLs are allowlisted before downloading.
- Reference assets are signed only for their owning user.

## Reliability

- Provider errors are explicit, never replaced with successful placeholder results.
- Jobs are durable and survive browser refresh.
- Model identifiers are validated against the active catalog.
- Timeouts and rate limits are bounded.
- A job is complete only after provider completion and private storage are confirmed.
