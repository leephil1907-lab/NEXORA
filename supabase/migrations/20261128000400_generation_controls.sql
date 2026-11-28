-- NEXORA generation controls: favorites, ratings, extensions.
-- Additive only — safe to run repeatedly.
alter table public.generations
  add column if not exists favorite boolean not null default false;

alter table public.generations
  add column if not exists rating smallint check (rating in (-1, 1));

alter table public.generations
  add column if not exists extended_from uuid references public.generations (id) on delete set null;

comment on column public.generations.rating is 'User feedback: 1 = satisfied, -1 = not satisfied, null = unrated.';
comment on column public.generations.extended_from is 'Set when this job continues a previous clip (Extend feature).';
