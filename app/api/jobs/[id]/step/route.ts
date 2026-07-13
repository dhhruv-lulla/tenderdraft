import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertProposal } from "@/lib/supabase/db";
import { fetchGenerationJob, updateGenerationJob, claimJobStage } from "@/lib/supabase/jobs";
import { extractTenderData } from "@/lib/extractTender";
import { fetchUrlText } from "@/lib/fetchUrlText";
import { buildProposalDocument, applyComplianceEnrichment } from "@/lib/buildProposalDocument";
import { enrichCompliance } from "@/lib/enrichCompliance";
import { flattenToText } from "@/lib/proposalDocument";

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
  if (job.status !== "queued" && job.status !== "extracted" && job.status !== "assembled") {
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
