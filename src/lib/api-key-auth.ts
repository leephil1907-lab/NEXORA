import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
export async function authenticateApiKey(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  const match = /^Bearer (nex_live_[a-f0-9]{64})$/.exec(authorization);
  if (!match) return { error: "A valid NEXORA bearer API key is required.", status: 401 as const };
  const tokenHash = createHash("sha256").update(match[1]).digest("hex");
  const admin = createAdminClient();
  const { data: key, error } = await admin.from("api_keys").select("id,user_id,expires_at,revoked_at").eq("token_hash", tokenHash).maybeSingle();
  if (error || !key || key.revoked_at) return { error: "API key is invalid or revoked.", status: 401 as const };
  if (key.expires_at && new Date(key.expires_at).getTime() <= Date.now()) return { error: "API key has expired.", status: 401 as const };
  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
  return { userId: key.user_id, admin };
}
