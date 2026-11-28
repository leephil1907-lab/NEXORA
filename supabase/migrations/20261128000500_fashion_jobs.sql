-- Durable, account-scoped fashion try-on jobs. Inputs remain in the private lumi-assets bucket.
create table if not exists public.fashion_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_prediction_id text unique,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed')),
  model_image_path text not null,
  product_image_path text not null,
  output_path text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fashion_jobs_user_created_idx
  on public.fashion_jobs(user_id, created_at desc);
alter table public.fashion_jobs enable row level security;
drop policy if exists "Users can read their fashion jobs" on public.fashion_jobs;
create policy "Users can read their fashion jobs" on public.fashion_jobs
  for select to authenticated using (auth.uid() = user_id);
comment on table public.fashion_jobs is
  'Account-scoped FASHN virtual try-on requests. Only ordinary clothing try-on is exposed by NEXORA.';
