-- Expand company_profiles with fields needed for a full GeM technical bid:
-- financial standing, legal identifiers, banking, and governance.
alter table company_profiles
  add column if not exists financials jsonb,
  add column if not exists net_worth text,
  add column if not exists total_assets text,
  add column if not exists cin text,
  add column if not exists pan text,
  add column if not exists bank_details jsonb,
  add column if not exists registered_address text,
  add column if not exists board_of_directors jsonb;
