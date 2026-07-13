"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock } from "lucide-react";
import DocumentUploader from "@/components/DocumentUploader";
import ProposalPanel from "@/components/ProposalPanel";
import { ToastStack, ToastData } from "@/components/Toast";
import type { CompanyProfile } from "@/lib/types";
import type { ProposalDocument } from "@/lib/proposalDocument";
import { buildHeaderInfo } from "@/lib/proposalDocument";

const POLL_INTERVAL_MS = 1800;
// Generous upper bound on total polling time, covering a full 3-stage run
// plus one server-side stale-job recovery cycle (see STALE_CLAIM_MS in the
// step route). If we're still polling past this, something is genuinely
// wrong server-side rather than just slow - stop and tell the user instead
// of spinning forever.
const MAX_POLL_MS = 5 * 60 * 1000;

const STAGE_LABELS: Record<string, string> = {
  queued: "Parsing tender document…",
  extracting: "Parsing tender document…",
  extracted: "Building your proposal…",
  assembling: "Building your proposal…",
  assembled: "Reviewing compliance terms…",
  enriching: "Reviewing compliance terms…",
};

export default function AppWorkspace({
  profile,
  isActive,
}: {
  profile: CompanyProfile;
  isActive: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [specUrl, setSpecUrl] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [proposalDocument, setProposalDocument] = useState<ProposalDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [filesErrorMsg, setFilesError] = useState<string | undefined>();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastId = useRef(0);

  // A ref, not just the `isGenerating` state, because state updates aren't
  // visible synchronously - two clicks in the same tick (fast double-click,
  // double-tap on mobile, a stray keyboard Enter alongside a click) could
  // both read `isGenerating === false` before React re-renders the disabled
  // button, and each would POST /api/jobs, creating two separate generation
  // jobs. The ref is set synchronously before anything async happens, so a
  // second call in the same tick sees it immediately and bails out.
  const isGeneratingRef = useRef(false);
  // Guards the poll loop itself: only one fetch to the step endpoint is ever
  // in flight at a time, and the next poll is scheduled only after the
  // previous one resolves (see pollJob below). A plain setInterval here was
  // the actual cause of the token blowup - it doesn't wait for its async
  // callback, so on every generation where a poll tick took longer than
  // POLL_INTERVAL_MS (normal for a real Claude call on a PDF), the next tick
  // fired anyway, saw the job still "queued" in the DB, and re-ran the full
  // extraction call concurrently. Sequential polling here is the client-side
  // half of the fix; claimJobStage on the server is the half that actually
  // guarantees it can't happen even across tabs/retries.
  const pollAbortRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerInfo = useMemo(() => buildHeaderInfo(profile), [profile]);

  useEffect(() => {
    return () => {
      pollAbortRef.current = true;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  const notify = (message: string, variant: "success" | "error") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setGenerating = (value: boolean) => {
    isGeneratingRef.current = value;
    setIsGenerating(value);
  };

  const stopPolling = () => {
    pollAbortRef.current = true;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  const pollJob = (jobId: string) => {
    pollAbortRef.current = false;
    const startedAt = Date.now();

    const tick = async () => {
      if (pollAbortRef.current) return;

      if (Date.now() - startedAt > MAX_POLL_MS) {
        stopPolling();
        setGenerating(false);
        setProgressLabel("");
        notify(
          "This is taking much longer than expected. Check your dashboard in a minute - it may still complete - or try generating again.",
          "error"
        );
        return;
      }

      try {
        const res = await fetch(`/api/jobs/${jobId}/step`, { method: "POST" });
        const data = await res.json();

        if (pollAbortRef.current) return; // stopped while this fetch was in flight

        if (!res.ok || data.status === "error") {
          stopPolling();
          setGenerating(false);
          setProgressLabel("");
          notify(data.errorMessage || data.error || "Failed to generate proposal.", "error");
          return;
        }

        if (data.status === "complete") {
          stopPolling();
          setGenerating(false);
          setProgressLabel("");
          setProposalDocument(data.proposalDocument);
          notify(
            data.saveWarning || "Proposal generated and saved to your dashboard.",
            data.saveWarning ? "error" : "success"
          );
          return;
        }

        setProgressLabel(STAGE_LABELS[data.status] || "Working on your proposal…");
      } catch {
        // Transient network error on a poll tick — fall through and retry.
      }

      if (!pollAbortRef.current) {
        pollTimeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    tick();
  };

  const handleGenerate = async () => {
    if (!isActive || isGeneratingRef.current) return;

    if (files.length === 0) {
      setFilesError("Upload at least one tender document (PDF) to continue.");
      return;
    }
    setFilesError(undefined);

    setGenerating(true);
    setProposalDocument(null);
    setProgressLabel(STAGE_LABELS.queued);

    try {
      const formData = new FormData();
      if (specUrl.trim()) {
        formData.append("specUrl", specUrl.trim());
      }
      if (additionalInstructions.trim()) {
        formData.append("additionalInstructions", additionalInstructions.trim());
      }
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/jobs", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start proposal generation.");
      }

      pollJob(data.jobId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate proposal.";
      notify(message, "error");
      setGenerating(false);
      setProgressLabel("");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-6 lg:w-[40%]">
          <div className="glass shadow-premium rounded-2xl p-6 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-wide text-white/40">
              Generating for
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {profile.companyName}
            </p>
            <Link
              href="/dashboard"
              className="mt-2 inline-block text-xs font-medium text-gold-dark hover:text-gold-light"
            >
              Not right? Edit your profile →
            </Link>
          </div>

          <DocumentUploader
            files={files}
            onFilesChange={setFiles}
            specUrl={specUrl}
            onSpecUrlChange={setSpecUrl}
            additionalInstructions={additionalInstructions}
            onAdditionalInstructionsChange={setAdditionalInstructions}
            error={filesErrorMsg}
          />

          {!isActive && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your account is being activated. Complete payment and contact us on WhatsApp to
                start generating proposals.
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !isActive}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-gold-light to-gold px-6 py-4 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-6px_rgba(201,168,76,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_12px_32px_-6px_rgba(201,168,76,0.65)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                {progressLabel || "Generating…"}
              </>
            ) : !isActive ? (
              <>
                <Lock className="h-[18px] w-[18px]" />
                Generate Proposal
              </>
            ) : (
              <>
                <Sparkles className="h-[18px] w-[18px]" />
                Generate Proposal
              </>
            )}
          </button>
        </div>

        <div className="w-full lg:w-[60%]">
          <ProposalPanel
            proposalDocument={proposalDocument}
            isGenerating={isGenerating}
            headerInfo={headerInfo}
            onNotify={notify}
          />
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
