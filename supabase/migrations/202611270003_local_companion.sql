-- Secure outbound-polling bridge between NEXORA cloud and a user's local inference runtime.
-- Device bearer tokens are only stored as SHA-256 hashes. No public RLS policies are granted.
create table if not exists public.local_inference_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  platform text not null default 'android' check (platform in ('android','linux','windows','macos','other')),
  token_hash text not null unique,
  status text not null default 'active' check (status in ('active','revoked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists local_inference_devices_user_idx
  on public.local_inference_devices(user_id, created_at desc);

create table if not exists public.local_inference_commands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null references public.local_inference_devices(id) on delete cascade,
  kind text not null default 'chat_completion' check (kind = 'chat_completion'),
  input jsonb not null,
  output text,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','expired')),
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  lease_expires_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes')
);
create index if not exists local_inference_commands_user_created_idx
  on public.local_inference_commands(user_id, created_at desc);
create index if not exists local_inference_commands_device_queue_idx
  on public.local_inference_commands(device_id, status, created_at);

alter table public.local_inference_devices enable row level security;
alter table public.local_inference_commands enable row level security;
-- Intentionally no client policies: all reads/writes are performed by authenticated
-- Next.js route handlers using the service-role client after ownership checks.

create or replace function public.claim_local_inference_command(
  p_device_id uuid,
  p_user_id uuid
)
returns setof public.local_inference_commands
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  update public.local_inference_commands
     set status = 'expired', completed_at = now(), error_message = 'Command expired before execution.'
   where device_id = p_device_id and user_id = p_user_id
     and status in ('queued','running') and expires_at <= now();

  update public.local_inference_commands
     set status = 'queued', lease_expires_at = null
   where device_id = p_device_id and user_id = p_user_id
     and status = 'running' and lease_expires_at <= now()
     and expires_at > now();

  select id into claimed_id
    from public.local_inference_commands
   where device_id = p_device_id and user_id = p_user_id
     and status = 'queued' and expires_at > now()
   order by created_at
   for update skip locked
   limit 1;

  if claimed_id is null then return; end if;

  return query
    update public.local_inference_commands
       set status = 'running', started_at = coalesce(started_at, now()),
           lease_expires_at = now() + interval '10 minutes'
     where id = claimed_id
     returning *;
end;
$$;

revoke all on function public.claim_local_inference_command(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_local_inference_command(uuid, uuid) to service_role;

comment on table public.local_inference_devices is
  'User-owned local inference agents. Only SHA-256 hashes of one-time-issued bearer tokens are stored.';
comment on table public.local_inference_commands is
  'Private command queue for local inference. Agents poll outbound; NEXORA never opens inbound ports on user devices.';
