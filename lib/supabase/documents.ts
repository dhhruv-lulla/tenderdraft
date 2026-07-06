import type { SupabaseClient } from "@supabase/supabase-js";

export const COMPANY_DOCUMENTS_BUCKET = "company-documents";
export const COMPANY_DOCUMENTS_TABLE = "company_documents";

export interface CompanyDocument {
  id: string;
  storagePath: string;
  fileName: string;
  label: string;
  sizeBytes: number;
  uploadedAt: string;
}

interface CompanyDocumentRow {
  id: string;
  storage_path: string;
  file_name: string;
  label: string;
  size_bytes: number;
  uploaded_at: string;
}

function rowToDocument(row: CompanyDocumentRow): CompanyDocument {
  return {
    id: row.id,
    storagePath: row.storage_path,
    fileName: row.file_name,
    label: row.label,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
  };
}

export async function fetchCompanyDocuments(
  supabase: SupabaseClient,
  userId: string
): Promise<CompanyDocument[]> {
  const { data, error } = await supabase
    .from(COMPANY_DOCUMENTS_TABLE)
    .select("id, storage_path, file_name, label, size_bytes, uploaded_at")
    .eq("user_id", userId)
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];
  return (data as CompanyDocumentRow[]).map(rowToDocument);
}

export async function uploadCompanyDocument(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  label: string
): Promise<{ document: CompanyDocument | null; error: string | null }> {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(COMPANY_DOCUMENTS_BUCKET)
    .upload(storagePath, file, { contentType: file.type || undefined });

  if (uploadError) {
    return { document: null, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from(COMPANY_DOCUMENTS_TABLE)
    .insert({
      user_id: userId,
      storage_path: storagePath,
      file_name: file.name,
      label,
      size_bytes: file.size,
    })
    .select("id, storage_path, file_name, label, size_bytes, uploaded_at")
    .single();

  if (error || !data) {
    // Metadata row failed after the upload succeeded - clean up the orphaned
    // object rather than leaving an untracked file in the bucket.
    await supabase.storage.from(COMPANY_DOCUMENTS_BUCKET).remove([storagePath]);
    return { document: null, error: error?.message || "Failed to save document record." };
  }

  return { document: rowToDocument(data as CompanyDocumentRow), error: null };
}

export async function deleteCompanyDocument(
  supabase: SupabaseClient,
  userId: string,
  document: CompanyDocument
): Promise<{ error: string | null }> {
  const { error: storageError } = await supabase.storage
    .from(COMPANY_DOCUMENTS_BUCKET)
    .remove([document.storagePath]);

  if (storageError) {
    return { error: storageError.message };
  }

  const { error } = await supabase
    .from(COMPANY_DOCUMENTS_TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("id", document.id);

  return { error: error?.message || null };
}

export async function getCompanyDocumentUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(COMPANY_DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error || !data) return null;
  return data.signedUrl;
}
