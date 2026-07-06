import Anthropic from "@anthropic-ai/sdk";
import type { TenderData } from "@/lib/tenderData";
import type { CompanyProfile } from "@/lib/types";

export interface ComplianceEnrichment {
  eligibilityNotes: Record<string, string>;
  termsNotes: Record<string, string>;
  coveringLetterNote: string;
}

const SYSTEM_PROMPT =
  "You are helping finalize an Indian government (GeM) tender bid document. You will be given a set of " +
  "already-known facts about the bidder company, a list of tender conditions/terms needing a compliance note, " +
  "and optionally the bidder's free-text instructions about tone or emphasis for the covering letter. " +
  "\n\nABSOLUTE RULE: you may ONLY restate, rephrase, or choose what to emphasize among the facts explicitly " +
  "given to you below. Never invent a certificate, figure, date, past project, or claim that isn't listed. " +
  "\n\nFor each compliance item, write one concise, professional note (max 2 sentences). If the given facts are " +
  "not sufficient to confirm compliance, the note must say so and end with the exact phrase 'To be filled by " +
  "client.' Do not add any other placeholder wording." +
  "\n\nThe bidder's free-text instructions (if provided) are a request for tone/emphasis only - e.g. 'emphasize " +
  "our fast delivery' or 'mention our work with X' should shape which of the ALREADY-LISTED facts you highlight " +
  "and how you phrase them, never introduce a new one. If an instruction asks you to mention something that is " +
  "not present in the known facts (a project, a certification, a number), do not invent it - simply leave " +
  "coveringLetterNote empty rather than fabricate. coveringLetterNote should be empty (\"\") whenever no " +
  "instructions were given or none of them can be honored from the known facts.";

const ENRICHMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["eligibilityNotes", "termsNotes", "coveringLetterNote"],
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
    coveringLetterNote: {
      type: "string",
      description:
        "One short paragraph (2-3 sentences) for the covering letter, built only from knownBidderFacts and " +
        "steered by additionalInstructions if given. Empty string if nothing can be honored from known facts.",
    },
  },
} as const;

function buildPrompt(tender: TenderData, profile: CompanyProfile, additionalInstructions?: string | null) {
  const knownFacts = {
    companyName: profile.companyName || null,
    yearsInOperation: profile.yearsInOperation || null,
    servicesOffered: profile.servicesOffered || null,
    udyamNumber: profile.udyamNumber || null,
    gstNumber: profile.gstNumber || null,
    cin: profile.cin || null,
    certifications: profile.certifications || null,
    pastProjects: profile.pastProjects.map((p) => ({
      client: p.client || null,
      delivered: p.delivered || null,
      outcome: p.outcome || null,
    })),
  };

  const eligibilityItems = Object.entries(tender.specialConditions)
    .filter(([, flag]) => flag.present)
    .map(([id, flag]) => ({ id, condition: id, sourceQuote: flag.sourceQuote }));

  const termsItems = [
    tender.emd.required
      ? { id: "emd", term: "Earnest Money Deposit (EMD)", detail: `Amount: ${tender.emd.amount || "not stated"}` }
      : null,
    tender.epbg.required
      ? {
          id: "epbg",
          term: "Performance Bank Guarantee (ePBG)",
          detail: `Percentage: ${tender.epbg.percentage || "not stated"}, Duration: ${
            tender.epbg.durationMonths || "not stated"
          } months`,
        }
      : null,
    ...tender.buyerAddedTerms.map((t, i) => ({ id: `term-${i}`, term: t.term, detail: t.category || "" })),
  ].filter((x): x is { id: string; term: string; detail: string } => x !== null);

  const userText = JSON.stringify(
    {
      knownBidderFacts: knownFacts,
      eligibilityConditionsToNote: eligibilityItems,
      termsToNote: termsItems,
      additionalInstructions: additionalInstructions?.trim() || null,
    },
    null,
    2
  );

  return { userText, eligibilityItems, termsItems, hasInstructions: Boolean(additionalInstructions?.trim()) };
}

export async function enrichCompliance(
  tender: TenderData,
  profile: CompanyProfile,
  additionalInstructions?: string | null
): Promise<ComplianceEnrichment | null> {
  try {
    const { userText, eligibilityItems, termsItems, hasInstructions } = buildPrompt(
      tender,
      profile,
      additionalInstructions
    );

    if (eligibilityItems.length === 0 && termsItems.length === 0 && !hasInstructions) {
      return { eligibilityNotes: {}, termsNotes: {}, coveringLetterNote: "" };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the known data:\n${userText}\n\nWrite the compliance notes and (if applicable) the covering letter note now, following the required schema exactly, using the same "id" values given above.`,
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: ENRICHMENT_SCHEMA },
      },
    });

    const parsed = message.parsed_output as {
      eligibilityNotes: Array<{ id: string; note: string }>;
      termsNotes: Array<{ id: string; note: string }>;
      coveringLetterNote: string;
    } | null;

    if (!parsed) return null;

    return {
      eligibilityNotes: Object.fromEntries(parsed.eligibilityNotes.map((r) => [r.id, r.note])),
      termsNotes: Object.fromEntries(parsed.termsNotes.map((r) => [r.id, r.note])),
      coveringLetterNote: parsed.coveringLetterNote || "",
    };
  } catch {
    return null;
  }
}
