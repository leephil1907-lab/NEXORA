import type { JobStatus } from "./schema";

export type { JobStatus };

export type GenerationSettingsSnapshot = {
  modelId: string;
  durationSeconds: number;
  resolution: string;
  aspectRatio: string;
  mode: string;
  cameraMovement: string;
  guidance: number;
  audio: boolean;
  sensitive: boolean;
};

export type Job = {
  id: string;
  kind: "image" | "video";
  prompt: string;
  aspect_ratio: string;
  status: JobStatus;
  provider_status?: string | null;
  error_message?: string | null;
  assetUrl?: string | null;
  asset_path?: string | null;
  asset_mime_type?: string | null;
  asset_bytes?: number | null;
  model_id?: string | null;
  settings?: GenerationSettingsSnapshot | null;
  favorite?: boolean;
  rating?: number | null;
  extended_from?: string | null;
  credits_reserved?: number;
  created_at: string;
  updated_at?: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  display_name: string | null;
  credits: number;
  role: string;
};

export type CatalogModelPublic = {
  id: string;
  label: string;
  modality: "image" | "video";
  provider: string;
  source: string;
  tagline: string;
  durations: number[];
  resolutions: string[];
  capabilities: Record<string, boolean>;
  /** Whether this model's provider is configured on the deployment. */
  ready?: boolean;
};

export type AppConfig = {
  authEnabled: boolean;
  generationEnabled: boolean;
  assistantEnabled: boolean;
  sensitiveEnabled: boolean;
  imageCreditCost: number;
  videoCreditCost: number;
  maxUploadMb: number;
  models: CatalogModelPublic[];
};
