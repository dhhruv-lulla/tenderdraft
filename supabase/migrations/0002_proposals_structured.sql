-- Store the structured proposal document and extracted tender data alongside
-- the existing flattened proposal_text, so new proposals can render as real
-- tables/notices/TOC while old rows keep working off proposal_text alone.
alter table proposals
  add column if not exists proposal_json jsonb,
  add column if not exists tender_data jsonb;
