# NEXORA — Creative Image & Video Studio

NEXORA is a focused creative studio for image generation, reference-based image editing, and text/image-to-video creation. The public creative tools use the configured Google Gemini engines, private Supabase storage, persistent job history, and account-scoped credit reservations/refunds.

## Product areas

| Route | Purpose |
| --- | --- |
| / | Creative studio dashboard and tool discovery |
| /tools | Searchable library of dedicated creative tools |
| /tools/[slug] | Focused workflow for one image or video tool |
| /studio | General creation workspace |
| /templates | Searchable prompt presets that open real tools |
| /cases | Reusable creative briefs and saved prompts |
| /characters | Private fictional character profiles and reference images |
| /chat | Hosted creative assistant with automatic engine routing |
| /workflows | Guided image, video, character and reference workflows |
| /tasks | Generation history, results, favorites and saved assets |
| /credits | Credit balance and configured generation rates |
| /api-access | Personal API key management |
| /profile | Account and usage summary |
| /studio/admin | Admin-only credit adjustments |
| /legal/terms, /legal/privacy | Legal pages |

## Dedicated creative tools

- AI Image Generator — text-to-image
- Image-to-Image Editor — reference-guided editing
- Same Style Studio — reference-guided style direction
- Avatar & Portrait Studio
- Product Photography
- Fashion & Design Studio
- Background & Scene Editor
- AI Image Enhancer
- Poster & Thumbnail Maker
- Text-to-Video Studio
- Image-to-Video Studio

Specialized image tools use focused prompt presets on the same configured Gemini image engine. They do not require users to choose a model. Tools that need a source image enforce that requirement before submission.

## Active generation engines

| Engine | Workflow | Model ID |
| --- | --- | --- |
| Google Gemini image generation | Text-to-image and reference image editing | gemini-3.1-flash-lite-image |
| Google Gemini Omni video | Text-to-video and image-to-video | gemini-omni-1.2-flash |

The application does not route these tools to Replicate or require Replicate credits. The Gemini image engine uses the Gemini image generation API. The video engine uses the Gemini Interactions API and supports polling the provider task until its video output is ready. Completed video file URIs are downloaded through the authenticated Google Files API and saved into the user's private media library.

## Generation lifecycle

1. The signed-in user submits a validated prompt and supported settings.
2. The server verifies account access and ownership of any reference assets.
3. Credits are reserved transactionally.
4. The configured Gemini provider is called and the job ID is persisted.
5. The status endpoint polls the real provider state.
6. Completed media is saved to the private lumi-assets bucket and exposed through signed URLs.
7. Failed jobs are marked failed and reserved credits are refunded.

Saved image results can be sent directly to Image-to-Video Studio from the task library. Character profiles can store reference images and open them in the Image-to-Image Editor. All generation history and saved assets are scoped to the signed-in user.

## Capabilities that are not advertised as active

NEXORA currently provides background/scene editing and generative image enhancement. It does not claim pixel-accurate transparent-background removal or dedicated super-resolution upscaling. Those require separate image-processing capabilities and should not be presented as completed tools until implemented and tested.

The guided workflows are real step-by-step links into supported features. There is no drag-and-drop node canvas or simulated node execution.

## API

| Endpoint | Purpose |
| --- | --- |
| GET /api/config | Runtime configuration and configured model entries |
| POST /api/generations | Validate, reserve credits and submit a real generation |
| GET /api/generations | Private generation history with signed asset URLs |
| GET /api/generations/[id] | Poll provider state and persist completed output |
| PATCH /api/generations/[id] | Favorite/rating updates |
| POST /api/uploads | Validate and store private reference images |
| GET /api/uploads?path=... | Create a signed URL for an asset owned by the current user |
| POST /api/assist | Prompt enhancement using the configured hosted chat chain |
| POST /api/chat | Hosted AI chat |
| /api/keys | Create, list and revoke personal API keys |
| /api/v1/account | API-key authenticated account and credit balance |
| /api/v1/models | API-key authenticated configured generation model catalog |

## Required environment

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY

Optional:
- OMEGA_API_KEY and provider settings for hosted chat fallback
- VENICE_API_KEY and provider settings for hosted chat fallback
- NEXORA_IMAGE_CREDIT_COST
- NEXORA_VIDEO_CREDIT_COST
- NEXORA_MAX_UPLOAD_MB
- NEXORA_ALLOW_SENSITIVE

Provider secrets must remain server-side and must never be exposed in browser code. Configure them in the Render service environment.

## Credits and payments

Credit rates are configured on the deployment and shown in the studio before submission. Credits are granted by an administrator. This deployment does not expose a payment checkout; no purchase flow is advertised as active.

## Development

~~~bash
npm ci
cp .env.example .env.local
npm run dev
npm run typecheck
npm run build
~~~

Database migrations live in supabase/migrations/ and must be applied in order.
