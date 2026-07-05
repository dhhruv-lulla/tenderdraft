"use client";

import { useState } from "react";
import { Clipboard, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { flattenToText, type ProposalDocument } from "@/lib/proposalDocument";
import { generateDocxFromDocument } from "@/lib/generateDocx";
import ProposalDocumentView from "@/components/ProposalDocumentView";

interface Props {
  proposalDocument: ProposalDocument | null;
  isGenerating: boolean;
  companyName: string;
  onNotify: (message: string, variant: "success" | "error") => void;
}

export default function ProposalPanel({
  proposalDocument,
  isGenerating,
  companyName,
  onNotify,
}: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!proposalDocument) return;
    setIsExporting(true);
    try {
      const blob = await generateDocxFromDocument(proposalDocument, companyName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (companyName || "TenderDraft").replace(/[^a-z0-9]+/gi, "-");
      a.download = `${safeName}-Tender-Proposal.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify("Word document downloaded successfully.", "success");
    } catch {
      onNotify("Could not generate the Word document. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!proposalDocument) return;
    try {
      await navigator.clipboard.writeText(flattenToText(proposalDocument));
      onNotify("Proposal copied to clipboard.", "success");
    } catch {
      onNotify("Could not copy to clipboard.", "error");
    }
  };

  return (
    <div className="glass shadow-premium flex h-full flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-7">
        <h2 className="text-base font-semibold text-white">
          Generated Proposal
        </h2>

        {proposalDocument && !isGenerating && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 py-2 text-xs font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download as Word Document
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        {isGenerating ? (
          <LoadingState />
        ) : proposalDocument ? (
          <ProposalDocumentView document={proposalDocument} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
        <FileText className="h-8 w-8 text-white/25" strokeWidth={1.5} />
      </div>
      <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
        Your AI-generated proposal will appear here. Upload your documents
        and click Generate to get started.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-white/10 border-t-gold" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 ring-1 ring-gold/25">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.75} />
        </div>
      </div>
      <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-white/60">
        Analysing documents and generating proposal…
      </p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {[100, 80, 90].map((w, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-white/5"
            style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
