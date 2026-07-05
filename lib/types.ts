import type { ProposalDocument } from "@/lib/proposalDocument";
import type { TenderData } from "@/lib/tenderData";

export interface PastProject {
  client: string;
  delivered: string;
  outcome: string;
}

export interface FinancialYear {
  year: string;
  turnover: string;
  profitAfterTax: string;
}

export interface BoardMember {
  name: string;
  designation: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
}

export const emptyBankDetails: BankDetails = {
  accountName: "",
  accountNumber: "",
  ifsc: "",
  bankName: "",
  branch: "",
};

export interface CompanyProfile {
  companyName: string;
  yearsInOperation: string;
  gstNumber: string;
  udyamNumber: string;
  certifications: string;
  servicesOffered: string;
  teamSize: string;
  pastProjects: PastProject[];
  financials: FinancialYear[];
  netWorth: string;
  totalAssets: string;
  cin: string;
  pan: string;
  bankDetails: BankDetails;
  registeredAddress: string;
  boardOfDirectors: BoardMember[];
}

export const emptyProfile: CompanyProfile = {
  companyName: "",
  yearsInOperation: "",
  gstNumber: "",
  udyamNumber: "",
  certifications: "",
  servicesOffered: "",
  teamSize: "",
  pastProjects: [],
  financials: [],
  netWorth: "",
  totalAssets: "",
  cin: "",
  pan: "",
  bankDetails: emptyBankDetails,
  registeredAddress: "",
  boardOfDirectors: [],
};

export interface Proposal {
  id: string;
  title: string;
  proposalText: string;
  companyName: string;
  createdAt: string;
  proposalJson?: ProposalDocument;
  tenderData?: TenderData;
}
