// Shared content model for a single compliance declaration/certificate
// letter. Rendered identically by both the PDF and DOCX renderers, and by
// both the pure-template (standard) and model-drafted (non-standard) paths -
// only the `paragraphs`/`bulletList` body ever differs between those two.

// Deliberately distinct from proposalDocument.ts's PLACEHOLDER ("To be filled
// by client"): the user asked for this exact wording for compliance
// documents specifically.
export const COMPLIANCE_PLACEHOLDER = "To be completed by bidder";

export interface CertificationFlag {
  authority: string;
  note: string;
}

export interface SignatureBlock {
  name: string;
  designation: string;
  company: string;
  date: string;
  place: string;
}

export interface LetterDocument {
  documentName: string;
  refLine: string;
  toLines: string[];
  subjectLine: string;
  salutation: string;
  paragraphs: string[];
  bulletList?: string[];
  closing: string;
  certification?: CertificationFlag;
  signatureBlock: SignatureBlock;
  placeholders: string[];
}

/** Tracks which fields had to fall back to COMPLIANCE_PLACEHOLDER, so the UI
 * can show the user exactly what remains to be filled in by hand before
 * signing - mirrors the Accumulator pattern already used in
 * buildProposalDocument.ts. */
export class PlaceholderTracker {
  items: string[] = [];

  field(label: string, value: string | null | undefined): string {
    const trimmed = (value ?? "").trim();
    if (trimmed) return trimmed;
    if (!this.items.includes(label)) this.items.push(label);
    return COMPLIANCE_PLACEHOLDER;
  }
}
