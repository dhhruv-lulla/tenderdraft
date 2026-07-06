-- Private storage bucket for user-uploaded supporting documents (GST
-- certificate, Udyam certificate, ISO certificate, PAN card, bank details,
-- past purchase orders, etc). Objects are stored at "<user_id>/<filename>",
-- and the RLS policies below key off that first path segment so each user
-- can only see/upload/delete their own files.
insert into storage.buckets (id, name, public)
values ('company-documents', 'company-documents', false)
on conflict (id) do nothing;

create policy "Users can view their own company documents"
  on storage.objects for select
  using (bucket_id = 'company-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own company documents"
  on storage.objects for insert
  with check (bucket_id = 'company-documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own company documents"
  on storage.objects for delete
  using (bucket_id = 'company-documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- Metadata/display table alongside the raw storage objects (friendly label,
-- upload date, etc). storage_path points at the object in the bucket above.
create table if not exists company_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  label text not null,
  size_bytes bigint not null default 0,
  uploaded_at timestamptz not null default now()
);

alter table company_documents enable row level security;

create policy "Users can view their own company document records"
  on company_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own company document records"
  on company_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own company document records"
  on company_documents for delete
  using (auth.uid() = user_id);
