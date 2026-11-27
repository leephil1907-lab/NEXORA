# NEXORA Local Companion

The companion connects a user's local OpenAI-compatible text model to NEXORA without exposing the phone or opening inbound network ports. The agent polls NEXORA over HTTPS, claims one queued request, sends it to the local model, and posts the result back.

## Architecture

1. A signed-in NEXORA user registers a local device. NEXORA returns a random 256-bit bearer token once; only its SHA-256 hash is stored.
2. The companion stores the token in its private environment and polls `GET /api/local/agent/commands` over HTTPS.
3. NEXORA atomically leases a queued command to that device. A command is limited to ten minutes and a ten-minute reclaimable lease.
4. The agent sends the prompt to its local OpenAI-compatible endpoint (default `http://127.0.0.1:4891/v1`).
5. The agent submits the result using its device token. Users can inspect their own request status and revoke devices.

The cloud never initiates a connection to the phone. The phone makes outbound HTTPS requests, so NAT and mobile networks do not require port forwarding.

## Apply the database migration

Apply `supabase/migrations/202611270003_local_companion.sql` after the preceding migrations. The two tables have RLS enabled and intentionally expose no direct client policies. Server routes use the service-role client only after validating the user's session or device token and ownership.

## Register a device

In the authenticated NEXORA session, send:

```http
POST /api/local/devices
Content-Type: application/json

{"name":"My Android phone","platform":"android"}
```

Copy the returned `token` immediately. It is never returned by the list endpoint. Revoke a lost device with `DELETE /api/local/devices/{id}`.

## Run on Android with Termux

Install Node.js in Termux and make sure the local model application is running with its OpenAI-compatible API enabled on localhost port 4891.

```bash
pkg update
pkg install nodejs
```

Download `scripts/nexora-local-agent.mjs` from this repository, then run it:

```bash
export NEXORA_URL="https://YOUR-NEXORA-DOMAIN"
export NEXORA_DEVICE_TOKEN="PASTE-ONE-TIME-DEVICE-TOKEN"
export LOCAL_LLM_URL="http://127.0.0.1:4891/v1"
export LOCAL_LLM_MODEL="local"
node nexora-local-agent.mjs
```

Keep the companion running while you use local inference. Do not share the device token or put it in browser JavaScript, a public repository, or a URL. If it is exposed, revoke the device and register a replacement.

## API

- `POST /api/local/devices` — create device and receive one-time token.
- `GET /api/local/devices` — list own devices; token hashes are never exposed.
- `DELETE /api/local/devices/{id}` — revoke a device and expire its pending work.
- `POST /api/local/requests` — queue a prompt for one of the user's active devices.
- `GET /api/local/requests/{id}` — read own request status and result.
- `GET /api/local/agent/commands` — device-authenticated polling and atomic claim.
- `POST /api/local/agent/commands/{id}/complete` — device-authenticated result submission.

## Current scope and limitations

This first integration supports text chat completions only. It does not route image/video generation, replace Replicate, or integrate with the FASHN try-on pipeline. The companion is a Node.js bridge intended for Termux and other Node-capable hosts; a polished native Flutter companion UI is a later phase. The local inference service must itself be running and reachable at the configured localhost URL.

The server currently issues device credentials only to signed-in accounts that have completed NEXORA's existing age-assurance step. That step is a DOB self-declaration, not identity-document verification.
