export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "notice"; variant: "info" | "warning"; title: string; text: string; items?: string[] }
  | { type: "checklist"; items: string[] }
  | { type: "signature" };

export interface ProposalSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface ProposalDocument {
  sections: ProposalSection[];
}

export const PLACEHOLDER = "To be filled by client";

// Printed on every page of the Word export and at the top/bottom of the
// on-screen view, so it lives alongside the document model rather than in
// generateDocx.ts or ProposalDocumentView.tsx specifically.
export interface ProposalHeaderInfo {
  companyName: string;
  gstNumber: string;
  udyamNumber: string;
  contactDetails: string;
}

// Deliberately typed structurally (not `CompanyProfile`) to avoid a circular
// import - lib/types.ts already imports ProposalDocument from this file.
export function buildHeaderInfo(profile: {
  companyName: string;
  gstNumber: string;
  udyamNumber: string;
  registeredAddress: string;
}): ProposalHeaderInfo {
  return {
    companyName: profile.companyName.trim() || PLACEHOLDER,
    gstNumber: profile.gstNumber.trim() || PLACEHOLDER,
    udyamNumber: profile.udyamNumber.trim() || PLACEHOLDER,
    contactDetails: profile.registeredAddress.trim() || PLACEHOLDER,
  };
}

export function flattenToText(doc: ProposalDocument): string {
  const lines: string[] = [];

  for (const section of doc.sections) {
    lines.push(section.title);
    lines.push("");

    for (const block of section.blocks) {
      if (block.type === "heading") {
        lines.push(block.text);
      } else if (block.type === "paragraph") {
        lines.push(block.text);
      } else if (block.type === "bullet") {
        for (const item of block.items) {
          lines.push(`- ${item}`);
        }
      } else if (block.type === "table") {
        lines.push(block.headers.join(" | "));
        for (const row of block.rows) {
          lines.push(row.join(" | "));
        }
      } else if (block.type === "notice") {
        lines.push(block.title);
        lines.push(block.text);
        if (block.items) {
          for (const item of block.items) {
            lines.push(`- ${item}`);
          }
        }
      } else if (block.type === "checklist") {
        for (const item of block.items) {
          lines.push(`[ ] ${item}`);
        }
      } else if (block.type === "signature") {
        lines.push("Authorised Signatory");
        lines.push("Name:");
        lines.push("Designation:");
        lines.push("Date:");
        lines.push("Seal:");
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}
