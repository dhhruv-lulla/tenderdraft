"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, Loader2 } from "lucide-react";
import type { CompanyProfile, Proposal } from "@/lib/types";
import { generateDocxFromDocument, generateProposalDocx } from "@/lib/generateDocx";
import { buildHeaderInfo } from "@/lib/proposalDocument";

export default function ProposalHistoryList({
  proposals,
  profile,
}: {
  proposals: Proposal[];
  profile: CompanyProfile | null;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (proposal: Proposal) => {
    setDownloadingId(proposal.id);
    try {
      const headerInfo = buildHeaderInfo(
        profile ?? { companyName: proposal.companyName, gstNumber: "", udyamNumber: "", registeredAddress: "" }
      );
      const blob = proposal.proposalJson
        ? await generateDocxFromDocument(proposal.proposalJson, headerInfo)
        : await generateProposalDocx(proposal.proposalText, headerInfo.companyName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (proposal.companyName || "TenderDraft").replace(/[^a-z0-9]+/gi, "-");
      a.download = `${safeName}-Tender-Proposal.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="glass shadow-premium rounded-2xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
          <FileText className="h-6 w-6 text-white/30" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm text-white/50">
          You haven&apos;t generated any proposals yet.
        </p>
        <Link
          href="/app"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
        >
          Generate your first proposal
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {proposals.map((proposal) => (
        <div
          key={proposal.id}
          className="card-hover glass shadow-premium flex items-center justify-between gap-4 rounded-xl p-5 hover:shadow-premium-lg"
        >
          <Link href={`/dashboard/proposals/${proposal.id}`} className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{proposal.title}</p>
                <p className="text-xs text-white/40">
                  {new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => handleDownload(proposal)}
            disabled={downloadingId === proposal.id}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 disabled:opacity-60"
          >
            {downloadingId === proposal.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
