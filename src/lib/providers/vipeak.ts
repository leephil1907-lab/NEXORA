/**
 * Vipeak AI (123vips.com) — uncensored 18+ video generation API.
 *   Models: Seedance Spicy (t2v/i2v), Wan NSFW (t2v/i2v). Async tasks, credit
 *   billing, webhook callbacks. Public docs: github.com/wideeyededi/uncensored-nsfw-ai-video-api
 *
 * STATUS: honest — the full API contract (base URL, auth, endpoints) is only
 * published after unlocking "API DOCUMENTATION ACCESS" inside a signed-in
 * 123vips.com account. Until the operator sets VIPEAK_API_KEY + VIPEAK_BASE_URL
 * (from that documentation), every call reports exactly that. No invented
 * endpoints, no simulated output.
 */

export function vipeakConfigured(): boolean {
  return Boolean(process.env.VIPEAK_API_KEY && process.env.VIPEAK_BASE_URL);
}

export type VipeakModel = {
  id: string;
  label: string;
  kind: "t2v" | "i2v";
  tagline: string;
};

export const VIPEAK_MODELS: VipeakModel[] = [
  {
    id: "vipeak-seedance-spicy-t2v",
    label: "Seedance Spicy · Text to Video",
    kind: "t2v",
    tagline: "Uncensored 18+ text-to-video via Vipeak AI. Async task + credit billing.",
  },
  {
    id: "vipeak-seedance-spicy-i2v",
    label: "Seedance Spicy · Image to Video",
    kind: "i2v",
    tagline: "Uncensored 18+ image-to-video via Vipeak AI. Async task + credit billing.",
  },
  {
    id: "vipeak-wan-nsfw-t2v",
    label: "Wan NSFW · Text to Video",
    kind: "t2v",
    tagline: "Uncensored Wan video line for adults (18+), hosted by Vipeak AI.",
  },
  {
    id: "vipeak-wan-nsfw-i2v",
    label: "Wan NSFW · Image to Video",
    kind: "i2v",
    tagline: "Animate a still image with the uncensored Wan video line (18+).",
  },
];

export const VIPEAK_SETUP_MESSAGE =
  "Vipeak AI (123vips.com) is not configured on this deployment. Unlock \"API DOCUMENTATION ACCESS\" in your signed-in 123vips.com account (18+ confirmed), then set VIPEAK_BASE_URL and VIPEAK_API_KEY from the official docs. Integration guide: github.com/wideeyededi/uncensored-nsfw-ai-video-api";

/** Task creation is intentionally unimplemented until the official contract is in hand. */
export async function vipeakCreateTask(): Promise<never> {
  throw new Error(VIPEAK_SETUP_MESSAGE);
}
