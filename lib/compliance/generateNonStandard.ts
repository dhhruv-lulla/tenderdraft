import Anthropic from "@anthropic-ai/sdk";
import type { CompanyProfile } from "@/lib/types";
import type { RequiredDocument } from "@/lib/tenderData";
import { COMPLIANCE_PLACEHOLDER } from "@/lib/compliance/letterDocument";

// The only model call in the whole compliance-documents feature. Every
// standard declaration (MII, EMD exemption, non-blacklisting, bid security,
// ATC compliance, authorized signatory, warranty, land border, non-conviction,
// integrity pact) is pure template substitution - zero LLM calls. This one is
// reserved for a genuinely tender-specific requirement with no fixed format
// ("other"), and it is deliberately batched into a single call covering every
// such requirement in the job, never one call per document. It also never
// re-sends the tender PDF or the full company profile - only the specific
// requirement text and a handful of already-known bidder facts.

const SYSTEM_PROMPT =
  "You draft short, formal declaration/undertaking letters for Indian government (GeM) tender bids. You will be " +
  "given a small set of known bidder facts and a list of tender-specific requirements that have no standard " +
  "template. For each requirement, write 1-2 short, formal paragraphs in the same style as a standard bidder " +
  "declaration, addressing exactly what the requirement says the bidder must assert or contain." +
  `\n\nABSOLUTE RULE: only use the bidder facts explicitly given to you below. Never invent a certificate, ` +
  `figure, date, or claim that isn't listed. If the requirement needs a fact you were not given, write the ` +
  `exact placeholder text "${COMPLIANCE_PLACEHOLDER}" in its place rather than inventing a plausible-sounding ` +
  "value. Do not add any other placeholder wording.";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["declarations"],
  properties: {
    declarations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "paragraphs"],
        properties: {
          id: { type: "string" },
          paragraphs: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function generateNonStandardDeclarations(
  requirements: RequiredDocument[],
  profile: CompanyProfile
): Promise<Record<string, string[]>> {
  const nonStandard = requirements.filter((r) => r.standardTemplate === "other");
  if (nonStandard.length === 0) return {};

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Deliberately a tiny, hand-picked subset of the profile - never the
    // whole CompanyProfile object - and never the TenderData/tender PDF.
    const bidderFacts = {
      companyName: profile.companyName || null,
      gstNumber: profile.gstNumber || null,
      udyamNumber: profile.udyamNumber || null,
      cin: profile.cin || null,
    };

    const items = nonStandard.map((r) => ({
      id: r.id,
      name: r.name,
      whatItMustContain: r.whatItMustContain,
      sourceQuote: r.sourceQuote,
    }));

    const message = await anthropic.messages.parse({
      model: "claude-haiku-4-5",
      // Tight cap: these are 1-2 short paragraphs each, not full documents.
      max_tokens: Math.min(4000, 300 + nonStandard.length * 300),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify({ bidderFacts, requirements: items }, null, 2),
        },
      ],
      output_config: {
        format: { type: "json_schema", schema: SCHEMA },
      },
    });

    if (process.env.TENDERDRAFT_DEBUG_TOKENS) console.log("[generateNonStandardDeclarations usage]", message.usage);

    const parsed = message.parsed_output as { declarations: Array<{ id: string; paragraphs: string[] }> } | null;
    if (!parsed) return {};

    return Object.fromEntries(parsed.declarations.map((d) => [d.id, d.paragraphs]));
  } catch {
    // Degrade gracefully - the caller falls back to a placeholder paragraph
    // for any requirement this returns nothing for, and the rest of the
    // compliance pack (all standard, zero-LLM declarations) is unaffected.
    return {};
  }
}
