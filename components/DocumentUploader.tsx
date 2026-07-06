"use client";

import { useRef, useState } from "react";
import { FileText, Link2, UploadCloud, X } from "lucide-react";

interface Props {
  files: File[];
  onFilesChange: (files: File[]) => void;
  specUrl: string;
  onSpecUrlChange: (url: string) => void;
  additionalInstructions: string;
  onAdditionalInstructionsChange: (value: string) => void;
  error?: string;
}

export default function DocumentUploader({
  files,
  onFilesChange,
  specUrl,
  onSpecUrlChange,
  additionalInstructions,
  onAdditionalInstructionsChange,
  error,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length === 0) return;

    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const merged = [
      ...files,
      ...pdfs.filter((f) => !existingKeys.has(`${f.name}-${f.size}`)),
    ];
    onFilesChange(merged);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="glass shadow-premium rounded-2xl p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
          <FileText className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <h2 className="text-base font-semibold text-white">
          Tender Documents
        </h2>
      </div>

      <div className="mt-6">
        <span className="text-sm font-medium text-white">
          Upload Tender Documents
        </span>
        <p className="mt-1 text-xs text-white/45">
          Upload the main GeM bid document plus any linked specification
          documents.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
            isDragging
              ? "border-gold bg-gold/5"
              : error
                ? "border-red-400/40 bg-red-500/5"
                : "border-white/15 hover:border-gold/40 hover:bg-gold/5"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <UploadCloud className="h-[22px] w-[22px] text-white/50" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-sm font-medium text-white">
            Drag and drop PDF files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-white/40">
            Multiple PDF files supported
          </p>
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-red-400">{error}</p>
        )}

        {files.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <span className="truncate text-sm text-white/80">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-xs text-white/35">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="shrink-0 rounded-md p-1 text-white/40 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-7">
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-white">
            <Link2 className="h-3.5 w-3.5 text-white/50" />
            Specification Document URL (Optional)
          </span>
          <input
            type="url"
            value={specUrl}
            onChange={(e) => onSpecUrlChange(e.target.value)}
            placeholder="Paste URL if spec sheet is a live link"
            className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/15"
          />
        </label>
        <p className="mt-1.5 text-xs text-white/40">
          Some GeM tenders link to external specification documents. Paste
          the URL here and we will fetch the content automatically.
        </p>
      </div>

      <div className="mt-7">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-white">
            Additional Instructions (Optional)
          </span>
          <textarea
            rows={3}
            value={additionalInstructions}
            onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
            placeholder="Add any specific requirements for this bid, e.g. emphasize our fast delivery, mention a specific past project, adjust the tone."
            className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/15"
          />
        </label>
        <p className="mt-1.5 text-xs text-white/40">
          Used to guide tone and emphasis only. We will never invent a fact, figure, or
          credential that isn&apos;t already in your company profile.
        </p>
      </div>
    </div>
  );
}
