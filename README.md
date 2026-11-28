# NEXORA — AI Image & Video Studio

NEXORA is a focused creative workspace for generating images and videos, editing images with references, and turning generated images into video. It uses real provider jobs, private Supabase storage, persistent generation history and credit reservations/refunds.

The interface only lists models whose provider is configured. Unsupported model choices and unfinished provider integrations are not presented as available features.

## Product

| Route | Purpose |
| --- | --- |
| `/` | NEXORA home and supported creative entry points |
| `/studio` | Main image and video creation workspace |
| `/tools` | Supported image/video tools |
| `/templates` | Prompt presets that open supported tools |\n| `/cases` | Reusable creative briefs, starter cases and user-saved cases |\n| `/characters` | Private fictional character profiles and character-aware hosted chat |\n| `/workflows` | Guided image, video, character and reference production flows |\n| `/api-access` | API key management and available authenticated API endpoints |
| `/tasks` | Generation history, results and saved assets |
| `/chat` | Hosted creative assistant (Gemini first; configured fallbacks only) |
| `/profile` | Account and usage summary |
| `/credits` | Credit rules and configured rates |
| `/studio/admin` | Admin-only credit adjustments |
| `/legal/terms`, `/legal/privacy` | Legal pages |

## Supported generation models

All generation models use the server-side Replicate adapter. The public model list is filtered to providers that are configured on the deployment.

| Model | Type | Supported workflow |
| --- | --- | --- |
| `black-forest-labs/flux-schnell` | Image | Text-to-image |
| `black-forest-labs/flux-kontext-dev` | Image | Reference image editing |
| `wan-video/wan-2.2-t2v-fast` | Video | Text-to-video |
| `wan-video/wan-2.2-i2v-fast` | Video | Image-to-video |
| `wan-video/wan-2.2-i2v-a14b` | Video | Higher-quality image-to-video |
| `wan-video/wan-2.5-t2v` | Video | Text-to-video, 5 or 10 seconds |
| `wan-video/wan-2.5-i2v` | Video | Image-to-video, 5 or 10 seconds |
| `lightricks/ltx-video-0.9.7-distilled` | Video | Text/image-to-video and supported clip continuation |

The studio only enables controls supported by the selected model. Camera direction is prompt conditioning where the model has no dedicated camera parameter. Audio capability is shown as a model capability; the UI does not pretend a toggle can change a provider input when it cannot.

## Generation lifecycle

1. The signed-in user submits a validated model request.
2. The server verifies ownership of reference assets and creates a generation record.
3. Credits are reserved transactionally.
4. The provider prediction is created and its ID is persisted.
5. The status endpoint polls the provider and stores successful media in the private `lumi-assets` bucket.
6. Failed jobs are marked failed and reserved credits are refunded.

Generated image assets can be selected as image-to-video references. Clip continuation is available only on completed jobs whose selected model supports video input. Character profiles and saved cases are private to their owner. Character-aware chat prepends the selected character profile as creative context. Guided workflows link the supported stages; there is no drag-and-drop node canvas yet.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/config` | Public runtime configuration and only configured model entries |
| `POST /api/generations` | Validate, reserve credits and submit a real provider job |
| `GET /api/generations` | Private generation history with signed asset URLs |
| `GET /api/generations/[id]` | Poll provider state and persist completed output |
| `PATCH /api/generations/[id]` | Favorite/rating updates |
| `POST /api/uploads` | Validate and store private reference images |
| `POST /api/assist` | Prompt enhancement using the configured hosted chat chain |
| `POST /api/chat` | Hosted AI chat |
| `POST /api/admin/credits` | Admin-only credit adjustments |\n| `GET /api/keys`, `POST /api/keys`, `DELETE /api/keys?id=…` | Create, list and revoke personal API keys; raw keys are shown only once |\n| `GET /api/v1/account` | API-key authenticated account and credit balance |\n| `GET /api/v1/models` | API-key authenticated configured generation model catalog |

## Required environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REPLICATE_API_TOKEN`
- `GEMINI_API_KEY` (for hosted chat and prompt assistance)

Optional:
- `GEMINI_MODEL`
- `OMEGA_API_KEY` / Omega provider settings
- `VENICE_API_KEY` / Venice provider settings
- `NEXORA_IMAGE_CREDIT_COST`
- `NEXORA_VIDEO_CREDIT_COST`
- `NEXORA_MAX_UPLOAD_MB`
- `NEXORA_ALLOW_SENSITIVE`

Never place provider secrets in browser code. Configure them only in the Render service environment.

## Credits and payments

Credit rates are configured on the deployment and shown in the studio before submission. Credits are granted by an administrator. This deployment does not expose a payment checkout; no purchase flow is advertised as active.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
npm run typecheck
npm run build
```

Database migrations live in `supabase/migrations/` and must be applied in order.


## Generation billing

The active Studio catalog uses Google Gemini 3.1 Flash Lite Image for image generation and Gemini Omni 1.2 Flash for video generation. Replicate-dependent models have been removed from the active catalog. Google Gemini image and video generation are paid-tier features; a free-tier Gemini text API key does not include image/video generation. The Gemini API project must have billing enabled. NEXORA only submits a provider request after the user presses Generate.
