import type { CompanyProfile } from "@/lib/types";
import type { TenderData, TenderItem } from "@/lib/tenderData";
import { PLACEHOLDER, type Block, type ProposalDocument, type ProposalSection } from "@/lib/proposalDocument";
import type { ComplianceEnrichment } from "@/lib/enrichCompliance";

class Accumulator {
  actionItems: string[] = [];

  field(label: string, value: string | null | undefined): string {
    const trimmed = (value ?? "").trim();
    if (trimmed) return trimmed;
    this.note(label);
    return PLACEHOLDER;
  }

  note(label: string): void {
    if (!this.actionItems.includes(label)) {
      this.actionItems.push(label);
    }
  }
}

function parseFlexibleDate(raw: string | null): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    if (!isNaN(d.getTime())) return d;
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const d = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

function daysUntil(raw: string | null): number | null {
  const date = parseFlexibleDate(raw);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildCoveringLetter(acc: Accumulator, tender: TenderData, profile: CompanyProfile): ProposalSection {
  const buyer = acc.field("Buyer Organisation Name", tender.buyerOrganisation);
  const department = tender.department?.trim() || "";
  const bidNumber = acc.field("Bid Number", tender.bidNumber);
  const bidTitle = tender.bidTitle?.trim() || "the above-referenced tender";
  const deliveryPeriod = acc.field("Delivery Period", tender.deliveryPeriod);
  const emdLine = tender.emd.required
    ? `EMD of ${acc.field("EMD Amount", tender.emd.amount)} has been noted and our EMD compliance status is: ${PLACEHOLDER}.`
    : "No EMD is required for this tender as per the terms reviewed.";
  const epbgLine = tender.epbg.required
    ? `An ePBG of ${acc.field("ePBG Percentage", tender.epbg.percentage)} for ${acc.field(
        "ePBG Duration",
        tender.epbg.durationMonths
      )} months will be furnished as required.`
    : "No ePBG is required for this tender as per the terms reviewed.";

  const blocks: Block[] = [
    {
      type: "paragraph",
      text: `Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    },
    {
      type: "paragraph",
      text: `To,\n${buyer}${department ? `\n${department}` : ""}`,
    },
    {
      type: "paragraph",
      text: `Subject: Submission of Bid against Bid Number ${bidNumber} for ${bidTitle}`,
    },
    {
      type: "paragraph",
      text: `Dear Sir/Madam,`,
    },
    {
      type: "paragraph",
      text: `With reference to the above-mentioned tender published on the Government e-Marketplace (GeM), we, ${
        profile.companyName || PLACEHOLDER
      }, are pleased to submit our bid. We confirm the following:`,
    },
    {
      type: "bullet",
      items: [
        `Our bid shall remain valid for the period specified in the tender document.`,
        emdLine,
        epbgLine,
        `We accept the delivery period of ${deliveryPeriod} as specified in the tender.`,
        `We confirm having read and understood all terms, conditions, and Buyer Added Terms & Conditions of this tender, and our position on each is detailed in the Terms & Conditions Compliance Summary section of this document.`,
      ],
    },
    {
      type: "paragraph",
      text: `We request you to kindly consider our bid favourably.`,
    },
    {
      type: "paragraph",
      text: `Thanking you,\nFor ${profile.companyName || PLACEHOLDER},`,
    },
  ];

  return { id: "covering-letter", title: "Covering Letter / Letter of Offer", blocks };
}

function buildImportantNotice(tender: TenderData): ProposalSection {
  const remaining = daysUntil(tender.bidEndDate);
  const isUrgent = remaining !== null && remaining <= 7;

  let deadlineLine: string;
  if (remaining === null) {
    deadlineLine = tender.bidEndDate
      ? `Bid deadline as stated in the tender: ${tender.bidEndDate}. Please verify this date manually and confirm days remaining.`
      : `The bid submission deadline could not be determined from the uploaded document(s) — please locate and confirm it manually before proceeding.`;
  } else if (remaining < 0) {
    deadlineLine = `The extracted bid deadline (${tender.bidEndDate}) appears to be in the past — please verify this is correct before relying on it.`;
  } else {
    deadlineLine = `Bid submission deadline: ${tender.bidEndDate} — approximately ${remaining} day${
      remaining === 1 ? "" : "s"
    } remaining.`;
  }

  const blocks: Block[] = [
    {
      type: "notice",
      variant: isUrgent ? "warning" : "info",
      title: "IMPORTANT — PLEASE READ BEFORE SUBMISSION",
      text: `This document was auto-generated from the tender you uploaded and your saved company profile. Every field marked "${PLACEHOLDER}" must be completed before this bid is submitted on GeM. ${deadlineLine}`,
      items: isUrgent
        ? [
            "Confirm EMD / ePBG instrument and payment status",
            "Complete the 'Offered' column in every Technical Compliance table",
            "Fill in pricing in the separate Financial Bid (not in this document)",
            "Arrange every document listed under 'To Be Arranged Before Submission'",
          ]
        : undefined,
    },
  ];

  return { id: "important-notice", title: "Important Notice", blocks };
}

function buildBidReferenceSummary(acc: Accumulator, tender: TenderData): ProposalSection {
  const rows: string[][] = [
    ["Bid Number", acc.field("Bid Number", tender.bidNumber)],
    ["Bid Title", acc.field("Bid Title", tender.bidTitle)],
    ["Buyer Organisation", acc.field("Buyer Organisation", tender.buyerOrganisation)],
    ["Department / Ministry", [tender.department, tender.ministry].filter(Boolean).join(" / ") || PLACEHOLDER],
    ["Bid Publish Date", acc.field("Bid Publish Date", tender.bidPublishDate)],
    ["Bid Opening Date", acc.field("Bid Opening Date", tender.bidOpeningDate)],
    ["Bid End Date (Deadline)", acc.field("Bid End Date", tender.bidEndDate)],
    ["Category", acc.field("Category", tender.category)],
    ["Total Quantity", acc.field("Total Quantity", tender.totalQuantity)],
    [
      "EMD",
      tender.emd.required
        ? `Required — ${acc.field("EMD Amount", tender.emd.amount)}${
            tender.emd.exemptionNote ? ` (${tender.emd.exemptionNote})` : ""
          }`
        : "Not required",
    ],
    [
      "ePBG",
      tender.epbg.required
        ? `Required — ${acc.field("ePBG Percentage", tender.epbg.percentage)} for ${acc.field(
            "ePBG Duration",
            tender.epbg.durationMonths
          )} months`
        : "Not required",
    ],
    ["MSE Preference", tender.msePreference.applicable ? tender.msePreference.note || "Applicable" : "Not applicable"],
    ["MII Preference", tender.miiPreference.applicable ? tender.miiPreference.note || "Applicable" : "Not applicable"],
    ["Evaluation Method", acc.field("Evaluation Method", tender.evaluationMethod)],
    ["Payment Terms", acc.field("Payment Terms", tender.paymentTerms)],
    [
      "Documents Required",
      tender.documentsRequired.length > 0 ? tender.documentsRequired.join("; ") : PLACEHOLDER,
    ],
  ];

  return {
    id: "bid-reference-summary",
    title: "Bid Reference Summary",
    blocks: [{ type: "table", headers: ["Field", "Details"], rows }],
  };
}

function buildBidderProfile(acc: Accumulator, profile: CompanyProfile): ProposalSection {
  const rows: string[][] = [
    ["Company Name", acc.field("Company Name", profile.companyName)],
    ["Years in Operation", acc.field("Years in Operation", profile.yearsInOperation)],
    ["Team Size", acc.field("Team Size", profile.teamSize)],
    ["Registered Address", acc.field("Registered Address", profile.registeredAddress)],
    ["GST Number", acc.field("GST Number", profile.gstNumber)],
    ["Udyam Registration Number", acc.field("Udyam Registration Number", profile.udyamNumber)],
    ["CIN", acc.field("CIN", profile.cin)],
    ["PAN", acc.field("PAN", profile.pan)],
    ["Certifications", acc.field("Certifications", profile.certifications)],
    ["Services Offered", acc.field("Services Offered", profile.servicesOffered)],
  ];

  const blocks: Block[] = [{ type: "table", headers: ["Field", "Details"], rows }];

  if (profile.boardOfDirectors.length > 0) {
    blocks.push({ type: "heading", level: 3, text: "Board of Directors" });
    blocks.push({
      type: "table",
      headers: ["Name", "Designation"],
      rows: profile.boardOfDirectors.map((m) => [m.name || PLACEHOLDER, m.designation || PLACEHOLDER]),
    });
  } else {
    acc.note("Board of Directors details");
  }

  return { id: "bidder-profile", title: "Bidder / Company Profile", blocks };
}

const SPECIAL_CONDITION_LABELS: Array<{
  key: keyof TenderData["specialConditions"];
  label: string;
}> = [
  { key: "oemDealershipRequired", label: "OEM / Dealership Authorisation Requirement" },
  { key: "brandRegistrationRequired", label: "Brand Registration Requirement" },
  { key: "oneBidderOneBid", label: "One-Bidder-One-Bid Restriction" },
  { key: "manufacturerOnlyMsePreference", label: "Manufacturer-Only MSE Preference" },
];

function buildEligibilityCompliance(
  tender: TenderData,
  enrichmentNotes?: Record<string, string>
): ProposalSection {
  const rows = SPECIAL_CONDITION_LABELS.map(({ key, label }) => {
    const flag = tender.specialConditions[key];
    if (flag.present) {
      const note =
        enrichmentNotes?.[key] ||
        `Flagged in tender ("${flag.sourceQuote}"). ${PLACEHOLDER} — confirm and document compliance before submission.`;
      return [label, note];
    }
    return [label, "Not flagged in the tender document."];
  });

  return {
    id: "eligibility-compliance",
    title: "Eligibility & Qualification Compliance",
    blocks: [
      {
        type: "paragraph",
        text: "The following special conditions were checked against the tender document. The bidder must confirm compliance with every flagged condition before submission.",
      },
      { type: "table", headers: ["Condition", "Status / Bidder Action"], rows },
    ],
  };
}

function buildFinancialStanding(acc: Accumulator, profile: CompanyProfile): ProposalSection {
  const years = [...profile.financials];
  while (years.length < 3) {
    years.push({ year: "", turnover: "", profitAfterTax: "" });
  }

  const rows = years.slice(0, 3).map((y, i) => [
    y.year || `FY ${PLACEHOLDER} (Year ${i + 1})`,
    y.turnover || PLACEHOLDER,
    y.profitAfterTax || PLACEHOLDER,
  ]);

  if (rows.every((r) => r[1] === PLACEHOLDER)) {
    acc.note("Annual Turnover (last 3 financial years)");
  }

  return {
    id: "financial-standing",
    title: "Financial Standing",
    blocks: [
      {
        type: "table",
        headers: ["Financial Year", "Annual Turnover", "Profit After Tax"],
        rows,
      },
      {
        type: "table",
        headers: ["Metric", "Value"],
        rows: [
          ["Net Worth", acc.field("Net Worth", profile.netWorth)],
          ["Total Assets", acc.field("Total Assets", profile.totalAssets)],
        ],
      },
    ],
  };
}

function buildTechnicalOffer(tender: TenderData): ProposalSection {
  const blocks: Block[] = [];

  if (tender.items.length === 0) {
    blocks.push({
      type: "paragraph",
      text: `No item-level specifications were found in the tender document. ${PLACEHOLDER} — confirm the item list and specifications manually against the tender.`,
    });
  }

  tender.items.forEach((item: TenderItem, index: number) => {
    blocks.push({ type: "heading", level: 3, text: `Item ${index + 1}: ${item.itemName || item.description}` });
    blocks.push({
      type: "table",
      headers: ["Make", "Model", "Quantity", "Unit"],
      rows: [[item.make || PLACEHOLDER, item.model || PLACEHOLDER, item.quantity || PLACEHOLDER, item.unit || PLACEHOLDER]],
    });

    if (item.specifications.length > 0) {
      blocks.push({
        type: "table",
        headers: ["Required Specification", "Offered (to be filled by bidder)"],
        rows: item.specifications.map((spec) => [spec, ""]),
      });
    } else {
      blocks.push({
        type: "paragraph",
        text: `No specification lines were extracted for this item. ${PLACEHOLDER} — confirm required specifications manually.`,
      });
    }
  });

  return { id: "technical-offer", title: "Technical Offer", blocks };
}

function buildScopeDelivery(acc: Accumulator, tender: TenderData): ProposalSection {
  return {
    id: "scope-delivery",
    title: "Scope of Supply, Delivery & Logistics",
    blocks: [
      { type: "paragraph", text: acc.field("Scope of Supply", tender.scopeOfSupply) },
      {
        type: "table",
        headers: ["Field", "Details"],
        rows: [
          ["Delivery Period", acc.field("Delivery Period", tender.deliveryPeriod)],
          ["Consignee", acc.field("Consignee", tender.consignee)],
          ["Buyer Address", acc.field("Buyer Address", tender.buyerAddress)],
        ],
      },
    ],
  };
}

function buildTermsConditionsCompliance(
  acc: Accumulator,
  tender: TenderData,
  enrichmentNotes?: Record<string, string>
): ProposalSection {
  const rows: string[][] = [
    [
      "Earnest Money Deposit (EMD)",
      tender.emd.required
        ? enrichmentNotes?.["emd"] ||
          `EMD of ${acc.field("EMD Amount", tender.emd.amount)} required — ${PLACEHOLDER} (confirm payment or exemption)`
        : "Not required per tender — accepted.",
    ],
    [
      "Performance Bank Guarantee (ePBG)",
      tender.epbg.required
        ? enrichmentNotes?.["epbg"] ||
          `ePBG of ${acc.field("ePBG Percentage", tender.epbg.percentage)} for ${acc.field(
            "ePBG Duration",
            tender.epbg.durationMonths
          )} months required — ${PLACEHOLDER} (confirm arrangement)`
        : "Not required per tender — accepted.",
    ],
    [
      "Delivery Period",
      tender.deliveryPeriod ? `Accepted as per tender: ${tender.deliveryPeriod}` : PLACEHOLDER,
    ],
    [
      "Payment Terms",
      tender.paymentTerms ? `Accepted as per tender: ${tender.paymentTerms}` : PLACEHOLDER,
    ],
  ];

  if (tender.buyerAddedTerms.length > 0) {
    tender.buyerAddedTerms.forEach((term, i) => {
      rows.push([
        term.term,
        enrichmentNotes?.[`term-${i}`] || `${PLACEHOLDER} — confirm acceptance of this Buyer Added Term.`,
      ]);
    });
  } else {
    acc.note("Buyer Added Terms & Conditions review");
  }

  return {
    id: "terms-conditions-compliance",
    title: "Terms & Conditions Compliance Summary",
    blocks: [{ type: "table", headers: ["Tender Term", "Bidder Position"], rows }],
  };
}

function buildCommercialOffer(tender: TenderData): ProposalSection {
  const rows: string[][] =
    tender.items.length > 0
      ? tender.items.map((item, i) => [
          String(i + 1),
          item.itemName || item.description,
          item.quantity || PLACEHOLDER,
          item.unit || PLACEHOLDER,
          PLACEHOLDER,
          PLACEHOLDER,
          PLACEHOLDER,
        ])
      : [["1", PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER]];

  return {
    id: "commercial-offer",
    title: "Commercial Offer / Price Schedule",
    blocks: [
      {
        type: "table",
        headers: ["S.No", "Item", "Quantity", "Unit", "Rate (INR)", "GST %", "Total (INR)"],
        rows,
      },
      {
        type: "paragraph",
        text: "Note: Pricing, GST, and totals are intentionally left blank in this technical document. Final commercial figures must be entered only in the separate Financial Bid on GeM.",
      },
    ],
  };
}

function buildDocumentsChecklist(
  tender: TenderData,
  profile: CompanyProfile
): { section: ProposalSection; toArrange: string[] } {
  const available: string[] = [];
  const toArrange: string[] = [];

  if (profile.udyamNumber.trim()) available.push("Udyam Registration Certificate");
  else toArrange.push("Udyam Registration Certificate");

  if (profile.gstNumber.trim()) available.push("GST Registration Certificate");
  else toArrange.push("GST Registration Certificate");

  if (profile.cin.trim()) available.push("Certificate of Incorporation (CIN)");
  else toArrange.push("Certificate of Incorporation (CIN)");

  if (profile.pan.trim()) available.push("PAN Card");
  else toArrange.push("PAN Card");

  if (profile.certifications.trim()) available.push("Quality certifications (as listed in company profile)");
  else toArrange.push("Quality certification documents (e.g. ISO)");

  if (profile.bankDetails.accountNumber.trim()) available.push("Bank details / cancelled cheque");
  else toArrange.push("Bank details / cancelled cheque");

  if (tender.emd.required) toArrange.push("EMD instrument or exemption certificate");
  if (tender.epbg.required) toArrange.push("ePBG instrument");

  for (const doc of tender.documentsRequired) {
    if (!toArrange.includes(doc) && !available.includes(doc)) {
      toArrange.push(doc);
    }
  }

  return {
    section: {
      id: "documents-checklist",
      title: "Checklist of Documents",
      blocks: [
        { type: "heading", level: 3, text: "Available" },
        { type: "bullet", items: available.length > 0 ? available : ["None on file yet"] },
        { type: "heading", level: 3, text: "To Be Arranged Before Submission" },
        { type: "bullet", items: toArrange.length > 0 ? toArrange : ["None outstanding"] },
      ],
    },
    toArrange,
  };
}

function buildPreSubmissionChecklist(acc: Accumulator, outstandingDocs: string[]): ProposalSection {
  const items = [...acc.actionItems.map((label) => `Fill in: ${label}`), ...outstandingDocs.map((d) => `Arrange document: ${d}`)];

  return {
    id: "pre-submission-checklist",
    title: "Pre-Submission Checklist",
    blocks: [
      {
        type: "paragraph",
        text:
          items.length > 0
            ? "Complete every item below before this bid is submitted:"
            : "No outstanding placeholders were detected. Still do a final manual review before submission.",
      },
      { type: "checklist", items: items.length > 0 ? items : ["Final manual review of this document"] },
    ],
  };
}

function buildSignatureBlock(): ProposalSection {
  return { id: "signature-block", title: "Signature", blocks: [{ type: "signature" }] };
}

export function buildProposalDocument(tender: TenderData, profile: CompanyProfile): ProposalDocument {
  const acc = new Accumulator();

  const coveringLetter = buildCoveringLetter(acc, tender, profile);
  const importantNotice = buildImportantNotice(tender);
  const bidReferenceSummary = buildBidReferenceSummary(acc, tender);
  const bidderProfile = buildBidderProfile(acc, profile);
  const eligibilityCompliance = buildEligibilityCompliance(tender);
  const financialStanding = buildFinancialStanding(acc, profile);
  const technicalOffer = buildTechnicalOffer(tender);
  const scopeDelivery = buildScopeDelivery(acc, tender);
  const termsConditionsCompliance = buildTermsConditionsCompliance(acc, tender);
  const commercialOffer = buildCommercialOffer(tender);
  const { section: documentsChecklist, toArrange } = buildDocumentsChecklist(tender, profile);
  const signatureBlock = buildSignatureBlock();
  const preSubmissionChecklist = buildPreSubmissionChecklist(acc, toArrange);

  return {
    sections: [
      coveringLetter,
      importantNotice,
      bidReferenceSummary,
      bidderProfile,
      eligibilityCompliance,
      financialStanding,
      technicalOffer,
      scopeDelivery,
      termsConditionsCompliance,
      commercialOffer,
      documentsChecklist,
      signatureBlock,
      // Deliberately last: the document should end with a single consolidated
      // checklist of every placeholder and document still outstanding.
      preSubmissionChecklist,
    ],
  };
}

export function applyComplianceEnrichment(
  doc: ProposalDocument,
  tender: TenderData,
  enrichment: ComplianceEnrichment | null
): ProposalDocument {
  if (!enrichment) return doc;

  const acc = new Accumulator();
  const eligibilityCompliance = buildEligibilityCompliance(tender, enrichment.eligibilityNotes);
  const termsConditionsCompliance = buildTermsConditionsCompliance(acc, tender, enrichment.termsNotes);

  return {
    sections: doc.sections.map((section) => {
      if (section.id === "eligibility-compliance") return eligibilityCompliance;
      if (section.id === "terms-conditions-compliance") return termsConditionsCompliance;
      if (section.id === "covering-letter" && enrichment.coveringLetterNote.trim()) {
        // Insert the emphasis paragraph right after the confirmations bullet
        // list and before the closing ask - it must never be the only source
        // of a fact, so it only ever restates/reframes what's already here.
        const bulletIndex = section.blocks.findIndex((b) => b.type === "bullet");
        const insertAt = bulletIndex === -1 ? section.blocks.length : bulletIndex + 1;
        const blocks = [...section.blocks];
        blocks.splice(insertAt, 0, { type: "paragraph", text: enrichment.coveringLetterNote.trim() });
        return { ...section, blocks };
      }
      return section;
    }),
  };
}
