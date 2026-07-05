"use client";

import { useState } from "react";
import { Clipboard, Download, Loader2 } from "lucide-react";
import { generateDocxFromDocument, generateProposalDocx } from "@/lib/generateDocx";
import { flattenToText } from "@/lib/proposalDocument";
import type { ProposalDocument } from "@/lib/proposalDocument";

export default function ProposalDetailActions({
  proposalText,
  proposalJson,
  companyName,
}: {
  proposalText: string;
  proposalJson?: ProposalDocument;
  companyName: string;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = proposalJson
        ? await generateDocxFromDocument(proposalJson, companyName)
        : await generateProposalDocx(proposalText, companyName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (companyName || "TenderDraft").replace(/[^a-z0-9]+/gi, "-");
      a.download = `${safeName}-Tender-Proposal.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposalJson ? flattenToText(proposalJson) : proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
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
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5"
      >
        <Clipboard className="h-3.5 w-3.5" />
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </div>
  );
}
