import Anthropic from "@anthropic-ai/sdk";
import { TENDER_JSON_SCHEMA, type TenderData } from "@/lib/tenderData";

export interface TenderFileInput {
  name: string;
  base64: string;
}

const SYSTEM_PROMPT =
  "You are a meticulous data-extraction assistant for Indian government (GeM) tender documents. " +
  "Read the attached tender document(s) and any linked specification text, and extract only facts that are " +
  "explicitly present in the text. Never guess, infer, or invent a value. If a field is not stated in the " +
  "documents, return an empty string \"\" (or an empty array/false for array/boolean-style fields) for that " +
  "field - do not leave it out and do not make up a plausible-sounding value. For the specialConditions flags, " +
  "only set present:true if the tender text explicitly contains a clause establishing that condition, and quote " +
  "the exact source text verbatim in sourceQuote - do not paraphrase and do not set present:true without a " +
  "supporting quote (leave sourceQuote as an empty string when present is false)." +
  "\n\nrequiredDocuments - this is critical and needs careful reading: in GeM tenders, the specific documents, " +
  "declarations, certificates, and undertakings a bidder must submit are primarily specified in the tender's ATC " +
  "(Additional Terms and Conditions / Buyer Added Terms and Conditions) section, and these requirements differ " +
  "for every tender. Thoroughly read the ATC section (and any other section that imposes a submission " +
  "requirement) and identify EVERY compliance document, declaration, certificate, or undertaking the bidder is " +
  "required to submit - both common ones (e.g. Make in India / MII local content declaration, non-blacklisting " +
  "declaration, bid security declaration, EMD exemption declaration, authorized signatory letter, warranty " +
  "undertaking) and any tender-specific or unusual ones unique to this ATC. The ATC is the source of truth for " +
  "what is required - do not rely on a generic fixed list, and do not invent a requirement that the tender text " +
  "does not actually establish. For each one, classify it against the given standardTemplate enum if it matches " +
  "a well-known GeM declaration format, using 'other' only when it is genuinely tender-specific with no standard " +
  "format. Classify certificationType as 'external_certification' (not 'self_declaration') whenever the document " +
  "requires certification by a Chartered Accountant (e.g. CA-certified financial statements/turnover above a " +
  "threshold), an OEM/manufacturer (e.g. authorization or dealership letters), or a government authority " +
  "(e.g. a government-issued certificate) - everything else the bidder can sign themselves is 'self_declaration'.";

function buildUserContent(
  files: TenderFileInput[],
  specUrlText?: string
): Anthropic.Messages.ContentBlockParam[] {
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  for (const file of files) {
    content.push({
      type: "document",
      title: file.name,
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: file.base64,
      },
    });
  }

  if (specUrlText && specUrlText.trim()) {
    content.push({
      type: "text",
      text: `--- Linked Specification Document Content ---\n${specUrlText.trim()}`,
    });
  }

  content.push({
    type: "text",
    text: "Extract the tender data now, following the required schema exactly.",
  });

  return content;
}

async function callExtraction(
  anthropic: Anthropic,
  files: TenderFileInput[],
  specUrlText?: string
): Promise<unknown> {
  const message = await anthropic.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserContent(files, specUrlText) }],
    output_config: {
      format: { type: "json_schema", schema: TENDER_JSON_SCHEMA },
    },
  });

  if (process.env.TENDERDRAFT_DEBUG_TOKENS) console.log("[extractTenderData usage]", message.usage);

  return message.parsed_output;
}

export async function extractTenderData(
  files: TenderFileInput[],
  specUrlText?: string
): Promise<TenderData> {
  if (files.length === 0) {
    throw new Error("At least one tender document is required for extraction.");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let result = await callExtraction(anthropic, files, specUrlText);
  if (!result) {
    // One retry on truncated/invalid structured output before giving up.
    result = await callExtraction(anthropic, files, specUrlText);
  }

  if (!result) {
    throw new Error("Failed to extract structured tender data from the uploaded document(s).");
  }

  return result as TenderData;
}
