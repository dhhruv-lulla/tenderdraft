import type { SupabaseClient } from "@supabase/supabase-js";

export const COMPLIANCE_DOCUMENTS_BUCKET = "compliance-documents";
export const COMPLIANCE_DOCUMENTS_TABLE = "compliance_documents";

export interface ComplianceDocumentRecord {
  id: string;
  requirementId: string;
  documentName: string;
  certificationType: string;
  externalAuthority: string;
  standardTemplate: string;
  needsCertification: boolean;
  placeholders: string[];
  storagePathPdf: string;
  storagePathDocx: string;
  createdAt: string;
}

interface ComplianceDocumentRow {
  id: string;
  requirement_id: string;
  document_name: string;
  certification_type: string;
  external_authority: string;
  standard_template: string;
  needs_certification: boolean;
  placeholders: string[];
  storage_path_pdf: string;
  storage_path_docx: string;
  created_at: string;
}

const COLUMNS =
  "id, requirement_id, document_name, certification_type, external_authority, standard_template, needs_certification, placeholders, storage_path_pdf, storage_path_docx, created_at";

function rowToRecord(row: ComplianceDocumentRow): ComplianceDocumentRecord {
  return {
    id: row.id,
    requirementId: row.requirement_id,
    documentName: row.document_name,
    certificationType: row.certification_type,
    externalAuthority: row.external_authority,
    standardTemplate: row.standard_template,
    needsCertification: row.needs_certification,
    placeholders: row.placeholders || [],
    storagePathPdf: row.storage_path_pdf,
    storagePathDocx: row.storage_path_docx,
    createdAt: row.created_at,
  };
}

export async function fetchComplianceDocumentsByProposal(
  supabase: SupabaseClient,
  userId: string,
  proposalId: string
): Promise<ComplianceDocumentRecord[]> {
  const { data, error } = await supabase
    .from(COMPLIANCE_DOCUMENTS_TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as ComplianceDocumentRow[]).map(rowToRecord);
}

export interface UpsertComplianceDocumentInput {
  generationJobId: string;
  proposalId: string | null;
  requirementId: string;
  documentName: string;
  certificationType: string;
  externalAuthority: string;
  standardTemplate: string;
  needsCertification: boolean;
  placeholders: string[];
  pdfBuffer: Buffer;
  docxBuffer: Buffer;
  fileBaseName: string;
}

/**
 * Uploads both renditions of one compliance document and upserts its
 * metadata row, keyed on the (generation_job_id, requirement_id) unique
 * constraint from migration 0006. Storage uploads use upsert:true and the DB
 * write is a proper upsert, so re-running this for the same job/requirement
 * (e.g. after a stale-claim retry of the "documents" pipeline stage) safely
 * overwrites rather than duplicating.
 */
export async function upsertComplianceDocument(
  supabase: SupabaseClient,
  userId: string,
  input: UpsertComplianceDocumentInput
): Promise<{ record: ComplianceDocumentRecord | null; error: string | null }> {
  const storagePathPdf = `${userId}/${input.generationJobId}/${input.fileBaseName}.pdf`;
  const storagePathDocx = `${userId}/${input.generationJobId}/${input.fileBaseName}.docx`;

  const [pdfUpload, docxUpload] = await Promise.all([
    supabase.storage
      .from(COMPLIANCE_DOCUMENTS_BUCKET)
      .upload(storagePathPdf, input.pdfBuffer, { contentType: "application/pdf", upsert: true }),
    supabase.storage
      .from(COMPLIANCE_DOCUMENTS_BUCKET)
      .upload(storagePathDocx, input.docxBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      }),
  ]);

  if (pdfUpload.error || docxUpload.error) {
    return { record: null, error: pdfUpload.error?.message || docxUpload.error?.message || "Upload failed" };
  }

  const { data, error } = await supabase
    .from(COMPLIANCE_DOCUMENTS_TABLE)
    .upsert(
      {
        user_id: userId,
        generation_job_id: input.generationJobId,
        proposal_id: input.proposalId,
        requirement_id: input.requirementId,
        document_name: input.documentName,
        certification_type: input.certificationType,
        external_authority: input.externalAuthority,
        standard_template: input.standardTemplate,
        needs_certification: input.needsCertification,
        placeholders: input.placeholders,
        storage_path_pdf: storagePathPdf,
        storage_path_docx: storagePathDocx,
      },
      { onConflict: "generation_job_id,requirement_id" }
    )
    .select(COLUMNS)
    .single();

  if (error || !data) {
    return { record: null, error: error?.message || "Failed to save document record." };
  }

  return { record: rowToRecord(data as ComplianceDocumentRow), error: null };
}

export async function getComplianceDocumentUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(COMPLIANCE_DOCUMENTS_BUCKET).createSignedUrl(storagePath, 60);
  if (error || !data) return null;
  return data.signedUrl;
}
