import type { CompanyProfile } from "@/lib/types";
import type { RequiredDocument, TenderData } from "@/lib/tenderData";
import { COMPLIANCE_PLACEHOLDER, PlaceholderTracker, type LetterDocument } from "@/lib/compliance/letterDocument";
import { STANDARD_TEMPLATE_REGISTRY } from "@/lib/compliance/templates";
import { generateNonStandardDeclarations } from "@/lib/compliance/generateNonStandard";

export interface CompliancePackItem {
  requirement: RequiredDocument;
  letter: LetterDocument;
}

function buildScaffold(tender: TenderData, tracker: PlaceholderTracker) {
  const bidNumber = tracker.field("Bid Number", tender.bidNumber);
  const buyer = tracker.field("Buyer Organisation", tender.buyerOrganisation);
  const toLines = [buyer, tender.department, tender.buyerAddress].filter((v): v is string => Boolean(v?.trim()));

  return {
    refLine: `Ref: Bid No. ${bidNumber}`,
    toLines: toLines.length > 0 ? toLines : [buyer],
    salutation: "Dear Sir/Madam,",
    closing: "Yours faithfully,",
  };
}

function buildSignatureBlock(profile: CompanyProfile, tracker: PlaceholderTracker) {
  return {
    name: tracker.field("Authorized Signatory Name", profile.authorizedSignatoryName),
    designation: tracker.field("Authorized Signatory Designation", profile.authorizedSignatoryDesignation),
    company: tracker.field("Company Name", profile.companyName),
    // Always left for the bidder to fill at the moment of signing - never
    // guessed, since these are inherently unknown at generation time.
    date: COMPLIANCE_PLACEHOLDER,
    place: COMPLIANCE_PLACEHOLDER,
  };
}

function assembleLetter(
  requirement: RequiredDocument,
  tender: TenderData,
  profile: CompanyProfile,
  bodyOf: (tracker: PlaceholderTracker) => { paragraphs: string[]; bulletList?: string[] }
): LetterDocument {
  const tracker = new PlaceholderTracker();
  const scaffold = buildScaffold(tender, tracker);
  // Body is built against the same tracker as the scaffold/signature, so
  // every fallback (whether it's "Bid Number" from the scaffold or
  // "Udyam Registration Number" from a template body) lands in one list.
  const body = bodyOf(tracker);
  const signatureBlock = buildSignatureBlock(profile, tracker);

  return {
    documentName: requirement.name,
    refLine: scaffold.refLine,
    toLines: scaffold.toLines,
    subjectLine: `Subject: ${requirement.name}`,
    salutation: scaffold.salutation,
    paragraphs: body.paragraphs,
    bulletList: body.bulletList,
    closing: scaffold.closing,
    certification:
      requirement.certificationType === "external_certification"
        ? {
            authority: requirement.externalAuthority || "the certifying authority",
            note:
              `This document requires certification/signature by ${requirement.externalAuthority || "the certifying authority"} ` +
              `to be legally valid. TenderDraft prepares the format; the certification must be obtained separately.`,
          }
        : undefined,
    signatureBlock,
    placeholders: tracker.items,
  };
}

/**
 * Builds the full compliance document pack for a tender. Standard
 * declarations are pure template substitution (zero LLM calls); only
 * genuinely non-standard ("other") requirements are drafted by a single,
 * already-batched Haiku call (see generateNonStandardDeclarations) - never
 * one call per document, and never a re-send of the tender PDF or the full
 * company profile.
 */
export async function buildCompliancePack(
  tender: TenderData,
  profile: CompanyProfile
): Promise<CompliancePackItem[]> {
  // Defensive: a job created before this feature shipped could have
  // tenderData persisted without this field.
  const requirements = tender.requiredDocuments ?? [];
  if (requirements.length === 0) return [];

  const nonStandardDrafts = await generateNonStandardDeclarations(requirements, profile);

  return requirements.map((requirement) => {
    const templateFn = STANDARD_TEMPLATE_REGISTRY[requirement.standardTemplate];

    const letter = assembleLetter(requirement, tender, profile, (tracker) => {
      if (templateFn) {
        return templateFn({ profile, tender, requirement, tracker });
      }

      const draftParagraphs = nonStandardDrafts[requirement.id];
      if (draftParagraphs?.length) {
        return { paragraphs: draftParagraphs };
      }

      return {
        paragraphs: [
          requirement.whatItMustContain || requirement.name,
          `${COMPLIANCE_PLACEHOLDER}: this declaration could not be auto-drafted. Please prepare wording ` +
            `covering the requirement above based on the tender's ATC before submission.`,
        ],
      };
    });

    return { requirement, letter };
  });
}
