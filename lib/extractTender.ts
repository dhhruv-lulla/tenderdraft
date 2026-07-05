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
  "supporting quote (leave sourceQuote as an empty string when present is false).";

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
