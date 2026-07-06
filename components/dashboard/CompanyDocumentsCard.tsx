"use client";

import { useEffect, useState } from "react";
import { Download, FileText, FolderOpen, Loader2, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCompanyDocument,
  fetchCompanyDocuments,
  getCompanyDocumentUrl,
  uploadCompanyDocument,
  type CompanyDocument,
} from "@/lib/supabase/documents";

const LABEL_OPTIONS = [
  "GST Certificate",
  "Udyam Certificate",
  "ISO Certificate",
  "PAN Card",
  "Bank Details",
  "Purchase Order",
  "Other",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompanyDocumentsCard({ userId }: { userId: string }) {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState(LABEL_OPTIONS[0]);
  const [customLabel, setCustomLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    fetchCompanyDocuments(supabase, userId)
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleUpload = async () => {
    setError(null);

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    const effectiveLabel = label === "Other" ? customLabel.trim() : label;
    if (!effectiveLabel) {
      setError("Give this document a label.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const { document, error: uploadError } = await uploadCompanyDocument(
      supabase,
      userId,
      file,
      effectiveLabel
    );
    setUploading(false);

    if (uploadError || !document) {
      setError(uploadError || "Failed to upload document.");
      return;
    }

    setDocuments((prev) => [document, ...prev]);
    setFile(null);
    setCustomLabel("");
  };

  const handleDelete = async (doc: CompanyDocument) => {
    setDeletingId(doc.id);
    const supabase = createClient();
    const { error: deleteError } = await deleteCompanyDocument(supabase, userId, doc);
    setDeletingId(null);

    if (deleteError) {
      setError(deleteError);
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleDownload = async (doc: CompanyDocument) => {
    const supabase = createClient();
    const url = await getCompanyDocumentUrl(supabase, doc.storagePath);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else setError("Could not generate a download link. Please try again.");
  };

  return (
    <div className="glass shadow-premium mt-8 rounded-2xl p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/25">
          <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Company Documents</h2>
          <p className="text-xs text-white/40">
            Keep GST/Udyam/ISO certificates, PAN, bank details, and past purchase orders on
            hand for attaching to bids.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-white/55">Document Type</span>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/15"
          >
            {LABEL_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-navy text-white">
                {opt}
              </option>
            ))}
          </select>
        </label>

        {label === "Other" && (
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-white/55">Custom Label</span>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Trade License"
              className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/15"
            />
          </label>
        )}

        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-white/55">File</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs text-white/70 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-gold-dark"
          />
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 py-2.5 text-xs font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          Upload
        </button>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-white/40">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/40">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{doc.label}</p>
                    <p className="truncate text-xs text-white/40">
                      {doc.fileName} · {formatSize(doc.sizeBytes)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="rounded-md p-1.5 text-white/40 transition-colors duration-200 hover:bg-gold/10 hover:text-gold"
                    aria-label={`Download ${doc.fileName}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="rounded-md p-1.5 text-white/40 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Remove ${doc.fileName}`}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
