-- NEXORA age assurance metadata. Date of birth is validated transiently and is never stored.
alter table public.profiles
  add column if not exists age_verified_at timestamptz,
  add column if not exists age_verification_method text
    check (age_verification_method in ('self_attested_dob', 'third_party'));

create index if not exists profiles_age_verified_idx
  on public.profiles (age_verified_at)
  where age_verified_at is not null;

comment on column public.profiles.age_verified_at is
  'Timestamp when the account passed the configured age assurance flow; date of birth is not stored.';
comment on column public.profiles.age_verification_method is
  'Age assurance method. self_attested_dob is a self-declaration, not identity-document verification.';
