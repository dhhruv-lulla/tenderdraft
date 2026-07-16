"use client";

import { useState } from "react";
import { AlertTriangle, Download, FileText, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getComplianceDocumentUrl, type ComplianceDocumentRecord } from "@/lib/supabase/complianceDocuments";

interface Props {
  documents: ComplianceDocumentRecord[];
  onNotify?: (message: string, variant: "success" | "error") => void;
}

async function downloadFromStoragePath(storagePath: string, fileName: string): Promise<boolean> {
  const supabase = createClient();
  const url = await getComplianceDocumentUrl(supabase, storagePath);
  if (!url) return false;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    return false;
  }
}

function safeFileName(name: string, ext: string) {
  return `${name.replace(/[^a-z0-9]+/gi, "-").slice(0, 80)}.${ext}`;
}

export default function ComplianceDocumentsPanel({ documents, onNotify }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  if (documents.length === 0) return null;

  const handleDownload = async (doc: ComplianceDocumentRecord, format: "pdf" | "docx") => {
    setBusyId(`${doc.id}-${format}`);
    const ok = await downloadFromStoragePath(
      format === "pdf" ? doc.storagePathPdf : doc.storagePathDocx,
      safeFileName(doc.documentName, format)
    );
    setBusyId(null);
    if (!ok) onNotify?.(`Could not download ${doc.documentName}.`, "error");
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    let failures = 0;
    for (const doc of documents) {
      const ok = await downloadFromStoragePath(doc.storagePathPdf, safeFileName(doc.documentName, "pdf"));
      if (!ok) failures += 1;
      // Small gap between triggers so browsers don't treat rapid sequential
      // downloads as a popup-style flood and block them.
      await new Promise((r) => setTimeout(r, 350));
    }
    setDownloadingAll(false);
    if (failures > 0) {
      onNotify?.(`${failures} document(s) failed to download. Try them individually.`, "error");
    } else {
      onNotify?.("All compliance documents downloaded.", "success");
    }
  };

  return (
    <div className="glass shadow-premium mt-6 rounded-2xl">
      <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="text-base font-semibold text-white">Compliance Documents</h2>
          <p className="text-xs text-white/40">
            Every declaration this tender&apos;s ATC requires, generated from your company profile.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadAll}
          disabled={downloadingAll}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 py-2 text-xs font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloadingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download All (PDF)
        </button>
      </div>

      <div className="flex flex-col divide-y divide-white/10">
        {documents.map((doc) => (
          <div key={doc.id} className="flex flex-col gap-3 px-6 py-4 sm:px-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-2.5">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{doc.documentName}</p>
                  {doc.needsCertification ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-300">
                      <ShieldAlert className="h-3 w-3" />
                      Needs {doc.externalAuthority || "external"} certification
                    </span>
                  ) : (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      Self-declaration — ready to sign
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(doc, "pdf")}
                  disabled={busyId === `${doc.id}-pdf`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 disabled:opacity-50"
                >
                  {busyId === `${doc.id}-pdf` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(doc, "docx")}
                  disabled={busyId === `${doc.id}-docx`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 disabled:opacity-50"
                >
                  {busyId === `${doc.id}-docx` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  Word
                </button>
              </div>
            </div>

            {doc.needsCertification && (
              <div className="flex items-start gap-2 rounded-lg border border-red-400/20 bg-red-500/5 px-3.5 py-2.5 text-xs leading-relaxed text-red-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  This document requires certification/signature by {doc.externalAuthority || "the issuing authority"} to
                  be legally valid. TenderDraft prepares the format; the certification must be obtained separately.
                </span>
              </div>
            )}

            {doc.placeholders.length > 0 && (
              <p className="text-xs text-white/40">
                Needs your input before signing: {doc.placeholders.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
