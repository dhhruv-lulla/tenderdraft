-- Manual activation gate: new accounts start inactive until the operator
-- flips this on after payment is confirmed.
alter table company_profiles
  add column if not exists is_active boolean not null default false;

-- Free-text steering for the proposal generation pipeline (never a source of
-- new facts - only used to choose emphasis/phrasing among facts already on
-- file).
alter table generation_jobs
  add column if not exists additional_instructions text;
