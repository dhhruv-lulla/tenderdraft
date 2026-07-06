import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BankDetails,
  BoardMember,
  CompanyProfile,
  FinancialYear,
  PastProject,
  Proposal,
} from "@/lib/types";
import { emptyBankDetails } from "@/lib/types";
import type { ProposalDocument } from "@/lib/proposalDocument";
import type { TenderData } from "@/lib/tenderData";

export const COMPANY_PROFILES_TABLE = "company_profiles";
export const PROPOSALS_TABLE = "proposals";

const PROFILE_COLUMNS =
  "company_name, years_in_operation, team_size, services_offered, gst_number, udyam_number, certifications, past_projects, financials, net_worth, total_assets, cin, pan, bank_details, registered_address, board_of_directors";

const PROPOSAL_COLUMNS = "id, title, proposal_text, company_name_snapshot, created_at, proposal_json, tender_data";

interface CompanyProfileRow {
  company_name: string | null;
  years_in_operation: string | null;
  team_size: string | null;
  services_offered: string | null;
  gst_number: string | null;
  udyam_number: string | null;
  certifications: string | null;
  past_projects: PastProject[] | null;
  financials: FinancialYear[] | null;
  net_worth: string | null;
  total_assets: string | null;
  cin: string | null;
  pan: string | null;
  bank_details: BankDetails | null;
  registered_address: string | null;
  board_of_directors: BoardMember[] | null;
}

interface ProposalRow {
  id: string;
  title: string;
  proposal_text: string;
  company_name_snapshot: string;
  created_at: string;
  proposal_json: ProposalDocument | null;
  tender_data: TenderData | null;
}

function rowToProfile(row: CompanyProfileRow): CompanyProfile {
  return {
    companyName: row.company_name || "",
    yearsInOperation: row.years_in_operation || "",
    teamSize: row.team_size || "",
    servicesOffered: row.services_offered || "",
    gstNumber: row.gst_number || "",
    udyamNumber: row.udyam_number || "",
    certifications: row.certifications || "",
    pastProjects: row.past_projects || [],
    financials: row.financials || [],
    netWorth: row.net_worth || "",
    totalAssets: row.total_assets || "",
    cin: row.cin || "",
    pan: row.pan || "",
    bankDetails: row.bank_details || emptyBankDetails,
    registeredAddress: row.registered_address || "",
    boardOfDirectors: row.board_of_directors || [],
  };
}

function rowToProposal(row: ProposalRow): Proposal {
  return {
    id: row.id,
    title: row.title,
    proposalText: row.proposal_text,
    companyName: row.company_name_snapshot,
    createdAt: row.created_at,
    proposalJson: row.proposal_json || undefined,
    tenderData: row.tender_data || undefined,
  };
}

export async function fetchCompanyProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from(COMPANY_PROFILES_TABLE)
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProfile(data as CompanyProfileRow);
}

// Deliberately kept separate from CompanyProfile/fetchCompanyProfile: this
// flag is operator-managed (flipped manually in the Supabase dashboard after
// payment), never written by the app, so it must never round-trip through
// saveCompanyProfile's upsert payload.
export async function fetchIsActive(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(COMPANY_PROFILES_TABLE)
    .select("is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean((data as { is_active: boolean | null }).is_active);
}

export async function saveCompanyProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: CompanyProfile
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(COMPANY_PROFILES_TABLE).upsert(
    {
      user_id: userId,
      company_name: profile.companyName,
      years_in_operation: profile.yearsInOperation,
      team_size: profile.teamSize,
      services_offered: profile.servicesOffered,
      gst_number: profile.gstNumber,
      udyam_number: profile.udyamNumber,
      certifications: profile.certifications,
      past_projects: profile.pastProjects,
      financials: profile.financials,
      net_worth: profile.netWorth,
      total_assets: profile.totalAssets,
      cin: profile.cin,
      pan: profile.pan,
      bank_details: profile.bankDetails,
      registered_address: profile.registeredAddress,
      board_of_directors: profile.boardOfDirectors,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { error: error?.message || null };
}

export async function fetchProposals(
  supabase: SupabaseClient,
  userId: string
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from(PROPOSALS_TABLE)
    .select(PROPOSAL_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ProposalRow[]).map(rowToProposal);
}

export async function fetchProposal(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from(PROPOSALS_TABLE)
    .select(PROPOSAL_COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProposal(data as ProposalRow);
}

export async function insertProposal(
  supabase: SupabaseClient,
  userId: string,
  input: {
    title: string;
    proposalText: string;
    companyName: string;
    proposalJson?: ProposalDocument;
    tenderData?: TenderData;
  }
): Promise<{ proposal: Proposal | null; error: string | null }> {
  const { data, error } = await supabase
    .from(PROPOSALS_TABLE)
    .insert({
      user_id: userId,
      title: input.title,
      proposal_text: input.proposalText,
      company_name_snapshot: input.companyName,
      proposal_json: input.proposalJson ?? null,
      tender_data: input.tenderData ?? null,
    })
    .select(PROPOSAL_COLUMNS)
    .single();

  if (error || !data) return { proposal: null, error: error?.message || "Unknown error" };
  return { proposal: rowToProposal(data as ProposalRow), error: null };
}
