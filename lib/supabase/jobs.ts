import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyProfile } from "@/lib/types";
import type { ProposalDocument } from "@/lib/proposalDocument";
import type { TenderData } from "@/lib/tenderData";

export const GENERATION_JOBS_TABLE = "generation_jobs";

// "extracting" / "assembling" / "enriching" are in-flight claim states: a
// request must atomically flip the job into one of these via claimJobStage()
// before starting the expensive (LLM-calling) work for that stage. A
// concurrent request - from an overlapping poll, a second browser tab, or a
// client retry after a dropped connection - that arrives while the job is
// already in a claim state finds nothing to claim and just reports current
// status instead of redoing the work. This is what actually prevents
// duplicate Claude calls; client-side polling discipline is a complementary
// optimization, not a substitute for this.
export type JobStatus =
  | "queued"
  | "extracting"
  | "extracted"
  | "assembling"
  | "assembled"
  | "enriching"
  | "complete"
  | "error";

export interface GenerationJobFile {
  name: string;
  base64: string;
}

export interface GenerationJob {
  id: string;
  status: JobStatus;
  errorMessage: string | null;
  inputProfile: CompanyProfile;
  inputSpecUrl: string | null;
  inputFiles: GenerationJobFile[] | null;
  additionalInstructions: string | null;
  tenderData: TenderData | null;
  proposalJson: ProposalDocument | null;
  proposalText: string | null;
  companyNameSnapshot: string;
  resultProposalId: string | null;
  updatedAt: string;
}

const JOB_COLUMNS =
  "id, status, error_message, input_profile, input_spec_url, input_files, additional_instructions, tender_data, proposal_json, proposal_text, company_name_snapshot, result_proposal_id, updated_at";

interface JobRow {
  id: string;
  status: JobStatus;
  error_message: string | null;
  input_profile: CompanyProfile;
  input_spec_url: string | null;
  input_files: GenerationJobFile[] | null;
  additional_instructions: string | null;
  tender_data: TenderData | null;
  proposal_json: ProposalDocument | null;
  proposal_text: string | null;
  company_name_snapshot: string;
  result_proposal_id: string | null;
  updated_at: string;
}

function rowToJob(row: JobRow): GenerationJob {
  return {
    id: row.id,
    status: row.status,
    errorMessage: row.error_message,
    inputProfile: row.input_profile,
    inputSpecUrl: row.input_spec_url,
    inputFiles: row.input_files,
    additionalInstructions: row.additional_instructions,
    tenderData: row.tender_data,
    proposalJson: row.proposal_json,
    proposalText: row.proposal_text,
    companyNameSnapshot: row.company_name_snapshot,
    resultProposalId: row.result_proposal_id,
    updatedAt: row.updated_at,
  };
}

export async function createGenerationJob(
  supabase: SupabaseClient,
  userId: string,
  input: {
    profile: CompanyProfile;
    specUrl: string | null;
    files: GenerationJobFile[];
    additionalInstructions: string | null;
    companyName: string;
  }
): Promise<{ jobId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from(GENERATION_JOBS_TABLE)
    .insert({
      user_id: userId,
      status: "queued",
      input_profile: input.profile,
      input_spec_url: input.specUrl,
      input_files: input.files,
      additional_instructions: input.additionalInstructions,
      company_name_snapshot: input.companyName,
    })
    .select("id")
    .single();

  if (error || !data) return { jobId: null, error: error?.message || "Unknown error" };
  return { jobId: data.id as string, error: null };
}

export async function fetchGenerationJob(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<GenerationJob | null> {
  const { data, error } = await supabase
    .from(GENERATION_JOBS_TABLE)
    .select(JOB_COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToJob(data as JobRow);
}

/**
 * Atomically move a job from `fromStatus` to `toStatus`, but only if it is
 * still at `fromStatus` right now. The `.eq("status", fromStatus)` makes this
 * a single conditional UPDATE at the database level, so when two requests
 * race, exactly one of them gets rows back (claimed === true) and the other
 * gets zero rows back (claimed === false) - there is no window where both
 * can believe they own the stage. Callers must only do the expensive work
 * (the Claude call) after `claimed` comes back true.
 */
export async function claimJobStage(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  fromStatus: JobStatus,
  toStatus: JobStatus
): Promise<boolean> {
  const { data, error } = await supabase
    .from(GENERATION_JOBS_TABLE)
    .update({ status: toStatus, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id)
    .eq("status", fromStatus)
    .select("id");

  return !error && Array.isArray(data) && data.length > 0;
}

export interface UpdateGenerationJobInput {
  status?: JobStatus;
  errorMessage?: string | null;
  inputFiles?: GenerationJobFile[] | null;
  tenderData?: TenderData | null;
  proposalJson?: ProposalDocument | null;
  proposalText?: string | null;
  resultProposalId?: string | null;
}

export async function updateGenerationJob(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: UpdateGenerationJobInput
): Promise<{ error: string | null }> {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.status !== undefined) update.status = patch.status;
  if (patch.errorMessage !== undefined) update.error_message = patch.errorMessage;
  if (patch.inputFiles !== undefined) update.input_files = patch.inputFiles;
  if (patch.tenderData !== undefined) update.tender_data = patch.tenderData;
  if (patch.proposalJson !== undefined) update.proposal_json = patch.proposalJson;
  if (patch.proposalText !== undefined) update.proposal_text = patch.proposalText;
  if (patch.resultProposalId !== undefined) update.result_proposal_id = patch.resultProposalId;

  const { error } = await supabase
    .from(GENERATION_JOBS_TABLE)
    .update(update)
    .eq("user_id", userId)
    .eq("id", id);

  return { error: error?.message || null };
}
