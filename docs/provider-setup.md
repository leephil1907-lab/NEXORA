# Provider setup

## Google Gemini generation

NEXORA's active image and video tools use the Google Gemini Developer API. Configure this server-side variable in Render:

- GEMINI_API_KEY: Google Gemini API key for the project with image and video generation access.

The active catalog contains:

- gemini-3.1-flash-lite-image for text-to-image and reference-image editing.
- gemini-omni-1.2-flash for text-to-video and image-to-video.

Image generation uses the Gemini generateContent endpoint with image output enabled. Video generation uses the Gemini Interactions API, asynchronous job polling, and the Google Files API for returned video URIs. The server copies completed output into the user's private Supabase storage.

Image and video generation require a Gemini API project with the applicable paid-tier access and billing enabled. A text-only free-tier key is not sufficient. Do not add a Replicate fallback or advertise an engine that is not present in the active model catalog.

## Hosted chat

Gemini is the primary hosted chat engine and uses GEMINI_API_KEY plus GEMINI_MODEL. Optional fallbacks:

- OMEGA_API_KEY and OMEGA_BASE_URL
- VENICE_API_KEY and VENICE_BASE_URL

Fallbacks are for hosted text chat only; they are not image/video generation providers. Users do not choose models manually.

## Launch verification

Before enabling public generation, verify all of the following in the live Render environment:

1. GEMINI_API_KEY is present and belongs to a billing-enabled Google AI project.
2. GET /api/config reports both Gemini generation models as ready.
3. Text-to-image returns a real PNG/JPEG/WebP stored in the private lumi-assets bucket.
4. Image-to-image accepts a user-owned reference asset and returns a real edited image.
5. Text-to-video and image-to-video complete, return an authenticated Google video URI, and store the MP4 in private storage.
6. A failed provider job refunds its reserved credits.

Never display sample output as a completed generation. Provider errors must remain explicit.
