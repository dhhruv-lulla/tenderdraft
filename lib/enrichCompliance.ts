import Anthropic from "@anthropic-ai/sdk";
import type { TenderData } from "@/lib/tenderData";
import type { CompanyProfile } from "@/lib/types";

export interface ComplianceEnrichment {
  eligibilityNotes: Record<string, string>;
  termsNotes: Record<string, string>;
}

const SYSTEM_PROMPT =
  "You are helping finalize compliance notes for an Indian government (GeM) tender bid. You will be given a list " +
  "of tender conditions/terms and a set of already-known facts about the bidder company. For each item, write one " +
  "concise, professional compliance note (max 2 sentences). You may ONLY restate facts explicitly given to you below " +
  "- never invent a certificate, figure, date, or claim that isn't listed. If the given facts are not sufficient to " +
  "confirm compliance, the note must say so and end with the exact phrase 'To be filled by client.' Do not add any " +
  "other placeholder wording.";

const ENRICHMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["eligibilityNotes", "termsNotes"],
  properties: {
    eligibilityNotes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "note"],
        properties: { id: { type: "string" }, note: { type: "string" } },
      },
    },
    termsNotes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "note"],
        properties: { id: { type: "string" }, note: { type: "string" } },
      },
    },
  },
} as const;

function buildPrompt(tender: TenderData, profile: CompanyProfile) {
  const knownFacts = {
    companyName: profile.companyName || null,
    udyamNumber: profile.udyamNumber || null,
    gstNumber: profile.gstNumber || null,
    cin: profile.cin || null,
    certifications: profile.certifications || null,
  };

  const eligibilityItems = Object.entries(tender.specialConditions)
    .filter(([, flag]) => flag.present)
    .map(([id, flag]) => ({ id, condition: id, sourceQuote: flag.sourceQuote }));

  const termsItems = [
    tender.emd.required
      ? { id: "emd", term: "Earnest Money Deposit (EMD)", detail: `Amount: ${tender.emd.amount ?? "not stated"}` }
      : null,
    tender.epbg.required
      ? {
          id: "epbg",
          term: "Performance Bank Guarantee (ePBG)",
          detail: `Percentage: ${tender.epbg.percentage ?? "not stated"}, Duration: ${
            tender.epbg.durationMonths ?? "not stated"
          } months`,
        }
      : null,
    ...tender.buyerAddedTerms.map((t, i) => ({ id: `term-${i}`, term: t.term, detail: t.category ?? "" })),
  ].filter((x): x is { id: string; term: string; detail: string } => x !== null);

  const userText = JSON.stringify(
    {
      knownBidderFacts: knownFacts,
      eligibilityConditionsToNote: eligibilityItems,
      termsToNote: termsItems,
    },
    null,
    2
  );

  return { userText, eligibilityItems, termsItems };
}

export async function enrichCompliance(
  tender: TenderData,
  profile: CompanyProfile
): Promise<ComplianceEnrichment | null> {
  try {
    const { userText, eligibilityItems, termsItems } = buildPrompt(tender, profile);

    if (eligibilityItems.length === 0 && termsItems.length === 0) {
      return { eligibilityNotes: {}, termsNotes: {} };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the known facts and the items needing a compliance note:\n${userText}\n\nWrite the notes now, following the required schema exactly, using the same "id" values given above.`,
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: ENRICHMENT_SCHEMA },
      },
    });

    const parsed = message.parsed_output as
      | { eligibilityNotes: Array<{ id: string; note: string }>; termsNotes: Array<{ id: string; note: string }> }
      | null;

    if (!parsed) return null;

    return {
      eligibilityNotes: Object.fromEntries(parsed.eligibilityNotes.map((r) => [r.id, r.note])),
      termsNotes: Object.fromEntries(parsed.termsNotes.map((r) => [r.id, r.note])),
    };
  } catch {
    return null;
  }
}
