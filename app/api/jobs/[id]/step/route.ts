import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertProposal } from "@/lib/supabase/db";
import { fetchGenerationJob, updateGenerationJob } from "@/lib/supabase/jobs";
import { extractTenderData } from "@/lib/extractTender";
import { fetchUrlText } from "@/lib/fetchUrlText";
import { buildProposalDocument, applyComplianceEnrichment } from "@/lib/buildProposalDocument";
import { enrichCompliance } from "@/lib/enrichCompliance";
import { flattenToText } from "@/lib/proposalDocument";

export const runtime = "nodejs";
export const maxDuration = 55;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const job = await fetchGenerationJob(supabase, user.id, id);
  if (!job) {
    return NextResponse.json({ error: "Generation job not found." }, { status: 404 });
  }

  if (job.status === "complete" || job.status === "error") {
    return NextResponse.json({
      status: job.status,
      errorMessage: job.errorMessage,
      tenderData: job.tenderData,
      proposalDocument: job.proposalJson,
      proposalText: job.proposalText,
      resultProposalId: job.resultProposalId,
    });
  }

  try {
    if (job.status === "queued") {
      let specUrlText: string | undefined;
      if (job.inputSpecUrl) {
        try {
          const { text } = await fetchUrlText(job.inputSpecUrl);
          specUrlText = text;
        } catch {
          specUrlText = undefined;
        }
      }

      const tenderData = await extractTenderData(job.inputFiles ?? [], specUrlText);

      await updateGenerationJob(supabase, user.id, id, {
        status: "extracted",
        tenderData,
        inputFiles: null,
      });

      return NextResponse.json({ status: "extracted", tenderData });
    }

    if (job.status === "extracted") {
      if (!job.tenderData) {
        throw new Error("Tender data is missing for an already-extracted job.");
      }

      const proposalDocument = buildProposalDocument(job.tenderData, job.inputProfile);
      const proposalText = flattenToText(proposalDocument);

      await updateGenerationJob(supabase, user.id, id, {
        status: "assembled",
        proposalJson: proposalDocument,
        proposalText,
      });

      return NextResponse.json({ status: "assembled", proposalDocument, proposalText });
    }

    if (job.status === "assembled") {
      if (!job.tenderData || !job.proposalJson) {
        throw new Error("Tender data or proposal document is missing for an already-assembled job.");
      }

      const enrichment = await enrichCompliance(job.tenderData, job.inputProfile);
      const finalDocument = applyComplianceEnrichment(job.proposalJson, job.tenderData, enrichment);
      const finalText = flattenToText(finalDocument);

      const { proposal, error } = await insertProposal(supabase, user.id, {
        title: `${job.companyNameSnapshot} — Tender Response`,
        proposalText: finalText,
        companyName: job.companyNameSnapshot,
        proposalJson: finalDocument,
        tenderData: job.tenderData,
      });

      await updateGenerationJob(supabase, user.id, id, {
        status: "complete",
        proposalJson: finalDocument,
        proposalText: finalText,
        resultProposalId: proposal?.id ?? null,
      });

      return NextResponse.json({
        status: "complete",
        proposalDocument: finalDocument,
        proposalText: finalText,
        resultProposalId: proposal?.id ?? null,
        saveWarning: error ? "Proposal generated, but saving to your dashboard failed." : undefined,
      });
    }

    return NextResponse.json({ error: `Unexpected job status: ${job.status}` }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during generation.";
    await updateGenerationJob(supabase, user.id, id, { status: "error", errorMessage: message });
    return NextResponse.json({ status: "error", errorMessage: message });
  }
}
