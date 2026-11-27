# NEXORA — Real AI Image & Video Studio

NEXORA is a production-grade AI generation studio: photorealistic image synthesis and
cinematic video produced by **real model inference on real GPUs** — orchestrated with
durable jobs, private storage, transparent credits and honest status at every step.

> **No placeholders.** NEXORA never fabricates progress, sample outputs or simulated
> provider responses. When a provider is not configured, the product says exactly that
> and refuses the run — it never fakes one.

---

## Product surface

| Route | What it is |
| --- | --- |
| `/` | Product site — hero with a live WebGL crystal core (Three.js core module), model roster, process, credit model, FAQ |
| `/studio` | The creation console — image/video compose, model selection, live preview, library, credit ledger, admin tools |
| `/credits` | Credit economics — rate card, refund policy, ledger principles |
| `/sign-in` | Passwordless (magic-link) authentication |
| `/legal/terms`, `/legal/privacy` | Legal pages |

### API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/config` | Public runtime config: model catalog with live `ready` flags, credit costs, feature switches. No secrets. |
| `POST /api/generations` | Create a real generation job: validates settings against the model catalog, reserves credits, submits to the provider |
| `GET /api/generations?filter=all\|images\|videos\|favorites` | Job history with signed asset URLs |
| `GET /api/generations/[id]` | Job status — polls the live provider, persists output to private storage, refunds on failure |
| `PATCH /api/generations/[id]` | Favorite / rating feedback |
| `POST /api/uploads` | Reference-image upload (JPEG/PNG/WebP, magic-byte checked, private bucket) |
| `POST /api/assist` | Prompt assistant — real inference on the configured OpenAI-compatible LLM endpoint |
| `POST /api/admin/credits` | Operator credit adjustments (server-side admin role check) |

## The model catalog (all real)

| Studio entry | Backend | Modality | Notes |
| --- | --- | --- | --- |
| **Wan 2.2 T2V Fast** | `wan-video/wan-2.2-t2v-fast` (Replicate) | video | PrunaAI-optimized; 5 s clips in ~40 s at 480p |
| **Wan 2.2 I2V Fast** | `wan-video/wan-2.2-i2v-fast` (Replicate) | video | Image-to-video workhorse, 10M+ runs |
| **Wan 2.2 I2V A14B** | `wan-video/wan-2.2-i2v-a14b` (Replicate) | video | Full-quality I2V with step control |
| **Wan 2.5 T2V / I2V** | `wan-video/wan-2.5-t2v`, `wan-video/wan-2.5-i2v` (Replicate) | video | Up to 10 s, 480/720/1080p, one-pass A/V sync + lip-sync, custom voice |
| **LTX-Video** | `lightricks/ltx-video` (Replicate) | video | Full parameter control: guidance, frames, fps, seed, negative prompt |
| **LTX-Video 0.9.7** | `lightricks/ltx-video-0.9.7` (Replicate) | video | 30 FPS up to 1216×704 |
| **LTX-Video 0.9.7 Distilled** | `lightricks/ltx-video-0.9.7-distilled` (Replicate) | video | Fast 480/720p; accepts video input → **Extend +5s** |
| **FLUX.1 [schnell]** | `black-forest-labs/flux-schnell` (Replicate) | image | Photorealistic stills, native aspect ratios |
| **MOSS Image · Uncensored LoRA** | self-hosted endpoint (`NEXORA_IMAGE_ENDPOINT`) | image | `axiomofmind/Moss-image-nsfw-uncensored-lora-GGUF` |
| **Inkling 2 Mini / Dongfangshuo Qwen3.8** | self-hosted endpoint (`NEXORA_LLM_ENDPOINT`) | assistant | `AtomicChat/Inkling-2-Mini-Uncensored-GGUF`, `dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4` |

Every setting in the console is mapped honestly: parameters a model exposes directly
(duration, resolution, guidance…) are sent as schema fields; everything else (camera
movement, aspect for models without a native ratio) **conditions the prompt** — a real
mechanism, labelled as such in the UI. Unsupported controls are disabled, never faked.

### Self-hosted HuggingFace backends

The three GGUF models run on **your** GPU behind OpenAI-compatible HTTP APIs:

**Prompt assistant (`NEXORA_LLM_ENDPOINT` → `/v1/chat/completions`)**

```bash
# Inkling 2 Mini Uncensored (26.4B MoE, 3.4B active) — llama.cpp b12600+
./llama-server -m Inkling-2-Mini-Uncensored-AD-Q4_K.gguf \
  --mmproj mmproj-Inkling-2-Mini-Uncensored-F16.gguf --jinja -c 32768 -ngl 99

# Dongfangshuo Qwen3.8 27B NSFW — any OpenAI-compatible runtime
./llama-server -m Dongfangshuo-Qwen3.8-27B-NSFW-v4.gguf --jinja -c 8192 -ngl 99
```

**Image models (`NEXORA_IMAGE_ENDPOINT` → `/v1/images/generations`)**

Serve `axiomofmind/Moss-image-nsfw-uncensored-lora-GGUF` through ComfyUI (openai node),
LocalAI, or a custom diffusers gateway.

**WebGL scene** — the hero crystal core is written against the Three.js core ES module
conventions of the `ccore/ThreeJS-3D-Scenes-v2` dataset (custom shader material, inline
camera controls, no addons).

## Environment

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project (auth, Postgres, storage) |
| `REPLICATE_API_TOKEN` | Enables the Replicate models (Wan / LTX / FLUX) |
| `NEXORA_IMAGE_CREDIT_COST`, `NEXORA_VIDEO_CREDIT_COST`, `NEXORA_MAX_UPLOAD_MB` | Credit economy + upload limits |
| `NEXORA_LLM_ENDPOINT`, `NEXORA_LLM_API_KEY`, `NEXORA_LLM_MODEL` | Prompt-assistant backend (llama.cpp etc.) |
| `NEXORA_IMAGE_ENDPOINT`, `NEXORA_IMAGE_API_KEY`, `NEXORA_IMAGE_MODEL` | Custom image backend (ComfyUI/LocalAI etc.) |
| `NEXORA_ALLOW_SENSITIVE` | Enables the 18+ sensitive-content mode (consent gate in-app) |

## Credits

Credits are reserved transactionally on submit and spent only on real provider runs.
Failed jobs are refunded automatically (`refund_generation_credits`) with reason-tagged
ledger entries. This deployment runs **no payment processor** — credits are granted by
the operator (`/api/admin/credits`).

## Content policy

Sensitive-content mode is opt-in per run, locked behind an 18+ consent gate, and
prohibits sexual content involving minors, real people without consent, or any
non-consensual imagery. The gate acceptance is sent with every sensitive request and
enforced server-side.

## Development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
npm run build                # production build
npx tsc --noEmit && npx next lint
```

### Database

Migrations in `supabase/migrations/` (run in order): generation jobs + private storage
+ credit RPCs, billing/ledger tables, admin helpers, profile compatibility layer for
shared projects, and generation controls (`favorite`, `rating`, `extended_from`,
`model_id`, `settings`).

### Acceptance test

1. Sign in (magic link) → open `/studio`.
2. Choose **Wan 2.5 I2V** or **LTX-Video**.
3. Upload a real photograph as the start frame.
4. Enter a motion prompt → set duration/resolution/camera.
5. **Generate** — credits reserve, the job runs on a real cloud GPU.
6. The result appears in the preview player — playable, downloadable, stored in your
   private library with full job history.

If any step is unavailable (missing key, provider outage) NEXORA tells you exactly why,
refunds the reservation, and records the failure. It never simulates the output.
