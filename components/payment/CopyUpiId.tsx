"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyUpiId({ upiId }: { upiId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; the ID is still visible to copy manually
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 transition-all duration-200 hover:border-gold/40 hover:bg-gold/10"
    >
      <span className="font-mono text-sm font-semibold tracking-wide text-white">
        {upiId}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold transition-colors duration-200 group-hover:bg-gold/25">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </span>
    </button>
  );
}
