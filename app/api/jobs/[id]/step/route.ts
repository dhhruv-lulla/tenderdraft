import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertProposal } from "@/lib/supabase/db";
import { fetchGenerationJob, updateGenerationJob, claimJobStage } from "@/lib/supabase/jobs";
import { extractTenderData } from "@/lib/extractTender";
import { fetchUrlText } from "@/lib/fetchUrlText";
import { buildProposalDocument, applyComplianceEnrichment } from "@/lib/buildProposalDocument";
import { enrichCompliance } from "@/lib/enrichCompliance";
import { flattenToText, buildHeaderInfo } from "@/lib/proposalDocument";
import { buildCompliancePack } from "@/lib/compliance/buildCompliancePack";
import { generateComplianceLetterPdf } from "@/lib/compliance/letterPdf";
import { generateComplianceLetterDocx } from "@/lib/compliance/letterDocx";
import { upsertComplianceDocument, type ComplianceDocumentRecord } from "@/lib/supabase/complianceDocuments";

export const runtime = "nodejs";
export const maxDuration = 55;

// How long a job may sit in an in-flight state before we treat the request
// that claimed it as dead (function timeout, crash, platform blip) rather
// than just slow. Comfortably above maxDuration + network/cold-start
// overhead, so it never races a request that's still genuinely running.
const STALE_CLAIM_MS = 80_000;

function isStale(job: { updatedAt: string }): boolean {
  return Date.now() - new Date(job.updatedAt).getTime() > STALE_CLAIM_MS;
}

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

  // Terminal or already-claimed-by-another-request: normally just report
  // current state - some other request (an overlapping poll, a second tab, a
  // retry) is already doing the work for this stage, and doing it again here
  // would duplicate a Claude call, which is exactly the bug this route used
  // to have. The exception is a claim that's gone stale (the request that
  // made it died mid-stage): left alone that would leave the job stuck
  // forever, so we recover it - but only where recovery is actually safe.
  if (
    job.status !== "queued" &&
    job.status !== "extracted" &&
    job.status !== "assembled" &&
    job.status !== "enriched"
  ) {
    if (job.status === "extracting" && isStale(job)) {
      // No side effects beyond a Claude call and overwriting tenderData -
      // safe to just re-claim from scratch.
      const reclaimed = await claimJobStage(supabase, user.id, id, "extracting", "queued");
      if (reclaimed) return NextResponse.json({ status: "queued" });
    }

    if (job.status === "assembling" && isStale(job)) {
      // Pure function, no external side effects - safe to re-claim.
      const reclaimed = await claimJobStage(supabase, user.id, id, "assembling", "extracted");
      if (reclaimed) return NextResponse.json({ status: "extracted" });
    }

    if (job.status === "enriching" && isStale(job)) {
      // NOT safe to blindly retry: this stage calls insertProposal, a plain
      // INSERT with no dedup key. If the dead request had already created
      // the proposal row before dying, auto-retrying would create a second
      // one. Surface it instead - the user can check their dashboard (the
      // proposal may already be there) or just generate again.
      const reclaimed = await claimJobStage(supabase, user.id, id, "enriching", "error");
      if (reclaimed) {
        await updateGenerationJob(supabase, user.id, id, {
          errorMessage:
            "Generation timed out while finalizing your proposal. Check your dashboard - it may have already been saved - otherwise try generating again.",
        });
        return NextResponse.json({
          status: "error",
          errorMessage:
            "Generation timed out while finalizing your proposal. Check your dashboard - it may have already been saved - otherwise try generating again.",
        });
      }
    }

    if (job.status === "generating_documents" && isStale(job)) {
      // Unlike enriching, this stage IS safe to auto-retry: every write it
      // makes (storage uploads with upsert:true, and a DB upsert keyed on
      // (generation_job_id, requirement_id)) is idempotent, so re-running it
      // from scratch can only overwrite with an equivalent result, never
      // duplicate anything.
      const reclaimed = await claimJobStage(supabase, user.id, id, "generating_documents", "enriched");
      if (reclaimed) return NextResponse.json({ status: "enriched" });
    }

    const fresh = await fetchGenerationJob(supabase, user.id, id);
    return NextResponse.json({
      status: fresh?.status ?? job.status,
      errorMessage: fresh?.errorMessage ?? job.errorMessage,
      tenderData: fresh?.tenderData ?? job.tenderData,
      proposalDocument: fresh?.proposalJson ?? job.proposalJson,
      proposalText: fresh?.proposalText ?? job.proposalText,
      resultProposalId: fresh?.resultProposalId ?? job.resultProposalId,
    });
  }

  try {
    if (job.status === "queued") {
      const claimed = await claimJobStage(supabase, user.id, id, "queued", "extracting");
      if (!claimed) {
        const fresh = await fetchGenerationJob(supabase, user.id, id);
        return NextResponse.json({ status: fresh?.status ?? job.status });
      }

      let specUrlText: string | undefined;
      if (job.inputSpecUrl) {
        try {
          const { text } = await fetchUrlText(job.inputSpecUrl);
          specUrlText = text;
        } catch {
          specUrlText = undefined;
        }
      }

      // Sent exactly once, here, for the whole job: the raw tender PDF(s) are
      // read from the job row and passed to the model in this single call.
      // Nothing downstream (assembly, enrichment) ever re-sends the PDF.
      const tenderData = await extractTenderData(job.inputFiles ?? [], specUrlText);

      await updateGenerationJob(supabase, user.id, id, {
        status: "extracted",
        tenderData,
        inputFiles: null,
      });

      return NextResponse.json({ status: "extracted", tenderData });
    }

    if (job.status === "extracted") {
      const claimed = await claimJobStage(supabase, user.id, id, "extracted", "assembling");
      if (!claimed) {
        const fresh = await fetchGenerationJob(supabase, user.id, id);
        return NextResponse.json({ status: fresh?.status ?? job.status });
      }

      if (!job.tenderData) {
        throw new Error("Tender data is missing for an already-extracted job.");
      }

      // Pure templating - no LLM call, so this stage is cheap even without
      // the claim above, but claiming keeps the state machine consistent.
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
      const claimed = await claimJobStage(supabase, user.id, id, "assembled", "enriching");
      if (!claimed) {
        const fresh = await fetchGenerationJob(supabase, user.id, id);
        return NextResponse.json({ status: fresh?.status ?? job.status });
      }

      if (!job.tenderData || !job.proposalJson) {
        throw new Error("Tender data or proposal document is missing for an already-assembled job.");
      }

      const enrichment = await enrichCompliance(job.tenderData, job.inputProfile, job.additionalInstructions);
      const finalDocument = applyComplianceEnrichment(job.proposalJson, job.tenderData, enrichment);
      const finalText = flattenToText(finalDocument);

      const { proposal, error } = await insertProposal(supabase, user.id, {
        title: `${job.companyNameSnapshot}: Tender Response`,
        proposalText: finalText,
        companyName: job.companyNameSnapshot,
        proposalJson: finalDocument,
        tenderData: job.tenderData,
      });

      // Deliberately "enriched", not "complete": the compliance document
      // pack (built from this same already-extracted tenderData, no further
      // PDF or full-profile calls) still needs to run as its own bounded
      // stage before the job is truly done.
      await updateGenerationJob(supabase, user.id, id, {
        status: "enriched",
        proposalJson: finalDocument,
        proposalText: finalText,
        resultProposalId: proposal?.id ?? null,
      });

      return NextResponse.json({
        status: "enriched",
        proposalDocument: finalDocument,
        proposalText: finalText,
        resultProposalId: proposal?.id ?? null,
        saveWarning: error ? "Proposal generated, but saving to your dashboard failed." : undefined,
      });
    }

    if (job.status === "enriched") {
      const claimed = await claimJobStage(supabase, user.id, id, "enriched", "generating_documents");
      if (!claimed) {
        const fresh = await fetchGenerationJob(supabase, user.id, id);
        return NextResponse.json({ status: fresh?.status ?? job.status });
      }

      if (!job.tenderData) {
        throw new Error("Tender data is missing for an already-enriched job.");
      }

      // Standard declarations are pure template substitution (zero LLM
      // calls); only genuinely non-standard ATC requirements cost one
      // already-batched Haiku call here - never a re-send of the tender PDF
      // or the full company profile (see buildCompliancePack).
      const pack = await buildCompliancePack(job.tenderData, job.inputProfile);
      const headerInfo = buildHeaderInfo(job.inputProfile);

      const complianceDocuments: ComplianceDocumentRecord[] = [];
      for (const item of pack) {
        const [pdfBuffer, docxBlob] = await Promise.all([
          generateComplianceLetterPdf(item.letter, headerInfo),
          generateComplianceLetterDocx(item.letter, headerInfo),
        ]);
        const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
        const fileBaseName = `${item.requirement.id}-${item.requirement.name}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80);

        const { record } = await upsertComplianceDocument(supabase, user.id, {
          generationJobId: id,
          proposalId: job.resultProposalId,
          requirementId: item.requirement.id,
          documentName: item.letter.documentName,
          certificationType: item.requirement.certificationType,
          externalAuthority: item.requirement.externalAuthority,
          standardTemplate: item.requirement.standardTemplate,
          needsCertification: item.requirement.certificationType === "external_certification",
          placeholders: item.letter.placeholders,
          pdfBuffer,
          docxBuffer,
          fileBaseName: fileBaseName || item.requirement.id,
        });

        // A single document failing to upload never fails the whole job -
        // the proposal itself is already safely saved. Skip it; the rest of
        // the pack still gets generated and the job still completes.
        if (record) complianceDocuments.push(record);
      }

      await updateGenerationJob(supabase, user.id, id, { status: "complete" });

      return NextResponse.json({
        status: "complete",
        proposalDocument: job.proposalJson,
        proposalText: job.proposalText,
        resultProposalId: job.resultProposalId,
        complianceDocuments,
      });
    }

    return NextResponse.json({ error: `Unexpected job status: ${job.status}` }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during generation.";
    await updateGenerationJob(supabase, user.id, id, { status: "error", errorMessage: message });
    return NextResponse.json({ status: "error", errorMessage: message });
  }
}
