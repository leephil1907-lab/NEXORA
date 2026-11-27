import { z } from "zod";

export const aspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"]);
export const resolutionSchema = z.enum(["480p", "720p", "1080p"]);
export const modeSchema = z.enum(["standard", "professional"]);
export const cameraMovementSchema = z.enum([
  "static", "pan-left", "pan-right", "tilt-up", "tilt-down",
  "dolly-in", "dolly-out", "orbit-left", "orbit-right", "handheld",
]);

export const generationSettingsSchema = z.object({
  modelId: z.string().trim().min(1).max(120),
  durationSeconds: z.number().int().min(0).max(30),
  resolution: resolutionSchema,
  aspectRatio: aspectRatioSchema,
  mode: modeSchema,
  cameraMovement: cameraMovementSchema,
  guidance: z.number().min(1).max(10),
  audio: z.boolean(),
  sensitive: z.boolean(),
});

export const generationRequestSchema = z.object({
  kind: z.enum(["image", "video"]),
  prompt: z.string().trim().min(3).max(2500),
  settings: generationSettingsSchema,
  referenceAssetPath: z.string().min(1).max(500).optional(),
  endAssetPath: z.string().min(1).max(500).optional(),
  /** For Extend: a previous clip's stored asset path to continue from. */
  videoAssetPath: z.string().min(1).max(500).optional(),
  extendedFrom: z.string().uuid().optional(),
  /** Required when settings.sensitive is true (18+ consent gate). */
  sensitiveConsent: z.boolean().optional(),
});

export const generationPatchSchema = z
  .object({
    favorite: z.boolean().optional(),
    rating: z.union([z.literal(-1), z.literal(1), z.null()]).optional(),
  })
  .refine((v) => v.favorite !== undefined || v.rating !== undefined, {
    message: "Nothing to update.",
  });

export const generationIdSchema = z.string().uuid();
export type GenerationSettingsInput = z.infer<typeof generationSettingsSchema>;
export type JobStatus = "queued" | "processing" | "succeeded" | "failed" | "storage_failed";
