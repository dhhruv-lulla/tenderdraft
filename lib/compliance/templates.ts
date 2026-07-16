import type { CompanyProfile } from "@/lib/types";
import type { RequiredDocument, StandardDeclarationTemplate, TenderData } from "@/lib/tenderData";
import { PlaceholderTracker } from "@/lib/compliance/letterDocument";

export interface TemplateContext {
  profile: CompanyProfile;
  tender: TenderData;
  requirement: RequiredDocument;
  tracker: PlaceholderTracker;
}

export interface TemplateBody {
  paragraphs: string[];
  bulletList?: string[];
}

type TemplateFn = (ctx: TemplateContext) => TemplateBody;

// Every declaration here is pure string substitution from already-known
// company/tender facts - zero LLM calls. Legal wording for the well-known
// GeM formats cites the specific orders/rules requested: MII cites the
// PPP-MII order and GFR Rule 175 integrity clause, Bid Security cites the
// one-year suspension consequence, EMD exemption cites the MSME/Udyam basis.

const miiDeclaration: TemplateFn = ({ profile, tender, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const localContent = tender.miiPreference.note?.trim() || COMPLIANCE_FALLBACK_NOTE;
  return {
    paragraphs: [
      `We, ${company}, hereby declare that the goods/services being offered by us against this tender comply with ` +
        `the local content requirements under the Public Procurement (Preference to Make in India) Order, issued ` +
        `vide No. P-45021/2/2017-PP (BE-II) by the Department for Promotion of Industry and Internal Trade (DPIIT), ` +
        `as applicable to this procurement.`,
      `Local content details as applicable to this tender: ${localContent}`,
      `We understand that false declarations under this Order are covered under the Indian Penal Code and the ` +
        `provisions of General Financial Rules (GFR), Rule 175, relating to the integrity of the public ` +
        `procurement process, and that any misrepresentation may result in exclusion from future tenders and ` +
        `other action as deemed fit by the buyer.`,
    ],
  };
};

const emdExemption: TemplateFn = ({ profile, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const udyam = tracker.field("Udyam Registration Number", profile.udyamNumber);
  return {
    paragraphs: [
      `We, ${company}, hereby declare that we are registered as a Micro/Small Enterprise under the Udyam ` +
        `Registration framework of the Ministry of Micro, Small and Medium Enterprises (MSME), Government of ` +
        `India, bearing Udyam Registration Number ${udyam}.`,
      `On this basis, we claim exemption from payment of Earnest Money Deposit (EMD) for this tender, in ` +
        `accordance with the tender conditions and the extant Public Procurement Policy for Micro and Small ` +
        `Enterprises (MSEs) issued by the Government of India.`,
    ],
  };
};

const nonBlacklisting: TemplateFn = ({ profile, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  return {
    paragraphs: [
      `We, ${company}, hereby declare that our firm/company is not currently blacklisted, debarred, or under any ` +
        `suspension from bidding by any Ministry, Department, Public Sector Undertaking, or other Government ` +
        `organisation in India, on the date of submission of this bid.`,
      `We further declare that no criminal proceedings involving fraud, corruption, or moral turpitude in ` +
        `relation to business dealings are pending against the company or its proprietor(s)/partner(s)/director(s) ` +
        `that would render us ineligible to participate in this tender.`,
    ],
  };
};

const bidSecurityDeclaration: TemplateFn = ({ profile, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  return {
    paragraphs: [
      `We, ${company}, having read and understood the terms and conditions of this tender, do hereby ` +
        `unequivocally accept that our bid shall be liable for rejection, and that we as bidder shall be liable ` +
        `for suspension from the bidding process on GeM for a period of one year, if, before the award of ` +
        `contract, we withdraw or modify our bid during the bid validity period, or fail to sign the contract, or ` +
        `fail to furnish the required Performance Security/EMD, in accordance with the terms and conditions of ` +
        `this tender.`,
    ],
  };
};

const atcComplianceStatement: TemplateFn = ({ profile, tender, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const bidNumber = tracker.field("Bid Number", tender.bidNumber);
  return {
    paragraphs: [
      `We, ${company}, confirm having read, understood, and unconditionally accepted all clauses of the ` +
        `Additional Terms and Conditions (ATC) / Buyer Added Terms and Conditions of Bid No. ${bidNumber}, and ` +
        `undertake to comply with each of them in full if awarded the contract.`,
    ],
  };
};

const authorizedSignatory: TemplateFn = ({ profile, tender, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const bidNumber = tracker.field("Bid Number", tender.bidNumber);
  const name = tracker.field("Authorized Signatory Name", profile.authorizedSignatoryName);
  const designation = tracker.field("Authorized Signatory Designation", profile.authorizedSignatoryDesignation);
  return {
    paragraphs: [
      `This is to certify that ${name}, ${designation} of ${company}, is duly authorised to sign and submit the ` +
        `bid and all connected documents on behalf of the company against Bid No. ${bidNumber}, and to negotiate ` +
        `and enter into a contract with the buyer in this regard.`,
    ],
  };
};

const warrantyUndertaking: TemplateFn = ({ profile, tender, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const warrantyPeriod = tracker.field("Warranty Period", "");
  const scope = tender.scopeOfSupply?.trim() || tender.bidTitle?.trim() || "the goods/services supplied";
  return {
    paragraphs: [
      `We, ${company}, undertake to provide a warranty period of ${warrantyPeriod} on ${scope} supplied against ` +
        `this tender, and to repair or replace, free of cost, any item found defective in material or workmanship ` +
        `during the warranty period, in accordance with the terms of this tender.`,
    ],
  };
};

const landBorderDeclaration: TemplateFn = ({ profile, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  return {
    paragraphs: [
      `We, ${company}, hereby declare that our firm is not a bidder from a country which shares a land border ` +
        `with India, or, if it is, that it is registered with the Competent Authority as required under Office ` +
        `Memorandum No. F.No.6/18/2019-PPD dated 23 July 2020 issued by the Department of Expenditure, Ministry ` +
        `of Finance, Government of India, and that this bid is submitted in compliance with that Order.`,
    ],
  };
};

const nonConvictionDeclaration: TemplateFn = ({ profile, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  return {
    paragraphs: [
      `We, ${company}, hereby declare that neither the company nor any of its proprietor(s)/partner(s)/` +
        `director(s) has been convicted of any offence involving moral turpitude in relation to business dealings ` +
        `during the last five years.`,
    ],
  };
};

const integrityPact: TemplateFn = ({ profile, tender, tracker }) => {
  const company = tracker.field("Company Name", profile.companyName);
  const buyer = tracker.field("Buyer Organisation", tender.buyerOrganisation);
  return {
    paragraphs: [
      `We, ${company}, agree to enter into an Integrity Pact with ${buyer} for this tender, and undertake to ` +
        `observe the highest standard of ethics, transparency, and fairness in all our dealings in connection with ` +
        `this procurement.`,
      `We confirm that no bribe, gift, gratification, or undue influence of any kind has been, or will be, ` +
        `offered or extended by us, directly or indirectly, to any official of the buyer in order to secure this ` +
        `contract, and that any breach of this undertaking may result in termination of the contract and other ` +
        `action as deemed fit by the buyer.`,
    ],
  };
};

const COMPLIANCE_FALLBACK_NOTE = "not specified in the tender - confirm applicable local content percentage before signing";

export const STANDARD_TEMPLATE_REGISTRY: Partial<Record<StandardDeclarationTemplate, TemplateFn>> = {
  mii_declaration: miiDeclaration,
  emd_exemption: emdExemption,
  non_blacklisting: nonBlacklisting,
  bid_security_declaration: bidSecurityDeclaration,
  atc_compliance_statement: atcComplianceStatement,
  authorized_signatory: authorizedSignatory,
  warranty_undertaking: warrantyUndertaking,
  land_border_declaration: landBorderDeclaration,
  non_conviction_declaration: nonConvictionDeclaration,
  integrity_pact: integrityPact,
};
