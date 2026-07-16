-- Signatory fields used to auto-fill the signature block on generated
-- compliance declarations (see 0006 feature: Compliance Documents).
alter table company_profiles add column if not exists authorized_signatory_name text;
alter table company_profiles add column if not exists authorized_signatory_designation text;

-- Private storage bucket for the compliance document pack (PDF + DOCX)
-- generated per tender. Objects are stored at "<user_id>/<filename>", same
-- per-user path-prefix RLS pattern as the company-documents bucket.
insert into storage.buckets (id, name, public)
values ('compliance-documents', 'compliance-documents', false)
on conflict (id) do nothing;

create policy "Users can view their own compliance documents"
  on storage.objects for select
  using (bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own compliance documents"
  on storage.objects for insert
  with check (bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own compliance documents"
  on storage.objects for update
  using (bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own compliance documents"
  on storage.objects for delete
  using (bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- Metadata table alongside the raw storage objects. One row per required
-- document per generation job. requirement_id is the RequiredDocument.id from
-- that job's extracted tender data. The unique constraint on
-- (generation_job_id, requirement_id) lets the "documents" pipeline stage
-- upsert safely, so re-running it after a stale/interrupted claim can never
-- create duplicate rows or orphaned storage objects.
create table if not exists compliance_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_job_id uuid references generation_jobs(id) on delete cascade,
  proposal_id uuid references proposals(id) on delete cascade,
  requirement_id text not null,
  document_name text not null,
  certification_type text not null,
  external_authority text not null default '',
  standard_template text not null,
  needs_certification boolean not null default false,
  placeholders jsonb not null default '[]'::jsonb,
  storage_path_pdf text not null,
  storage_path_docx text not null,
  created_at timestamptz not null default now(),
  unique (generation_job_id, requirement_id)
);

alter table compliance_documents enable row level security;

create policy "Users can view their own compliance document records"
  on compliance_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own compliance document records"
  on compliance_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own compliance document records"
  on compliance_documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own compliance document records"
  on compliance_documents for delete
  using (auth.uid() = user_id);
