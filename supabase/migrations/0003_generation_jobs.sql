-- Backs the async generation pipeline: each proposal generation runs as a
-- resumable job so no single request has to do more than one Claude call,
-- keeping every step comfortably under Vercel's serverless timeout.
create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued',
  error_message text,
  input_profile jsonb not null,
  input_spec_url text,
  input_files jsonb,
  tender_data jsonb,
  proposal_json jsonb,
  proposal_text text,
  company_name_snapshot text not null,
  result_proposal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table generation_jobs enable row level security;

create policy "Users can view their own generation jobs"
  on generation_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generation jobs"
  on generation_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generation jobs"
  on generation_jobs for update
  using (auth.uid() = user_id);
