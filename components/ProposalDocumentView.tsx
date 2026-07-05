import type { Block, ProposalDocument } from "@/lib/proposalDocument";
import { AlertTriangle, Info } from "lucide-react";

function BlockView({ block }: { block: Block }) {
  if (block.type === "heading") {
    const sizeClass = block.level === 1 ? "text-lg" : block.level === 2 ? "text-base" : "text-sm";
    return (
      <h3 className={`mt-6 mb-2 font-bold text-gold ${sizeClass} first:mt-0`}>{block.text}</h3>
    );
  }

  if (block.type === "paragraph") {
    return <p className="py-1.5 text-sm leading-relaxed text-white/75 whitespace-pre-line">{block.text}</p>;
  }

  if (block.type === "bullet") {
    return (
      <ul className="my-1.5 list-disc pl-5">
        {block.items.map((item, i) => (
          <li key={i} className="py-0.5 text-sm leading-relaxed text-white/75">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-navy/60">
              {block.headers.map((h, i) => (
                <th key={i} className="border-b border-white/10 px-3 py-2 font-semibold text-white/85">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="odd:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className="border-b border-white/5 px-3 py-2 align-top text-white/70">
                    {cell || <span className="text-white/25">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "notice") {
    const warning = block.variant === "warning";
    return (
      <div
        className={`my-4 rounded-xl border px-4 py-4 ${
          warning ? "border-red-400/30 bg-red-500/10" : "border-gold/30 bg-gold/10"
        }`}
      >
        <div className="flex items-center gap-2">
          {warning ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-gold" />
          )}
          <span className={`text-sm font-bold ${warning ? "text-red-300" : "text-gold"}`}>{block.title}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{block.text}</p>
        {block.items && block.items.length > 0 && (
          <ul className="mt-2 list-disc pl-5">
            {block.items.map((item, i) => (
              <li key={i} className="py-0.5 text-sm leading-relaxed text-white/75">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border border-white/10 p-4 text-sm text-white/70">
      <p className="font-semibold text-white">For the Bidder,</p>
      <p className="mt-4">Authorised Signatory</p>
      <p>Name: ______________________</p>
      <p>Designation: ______________________</p>
      <p>Date: ______________________</p>
      <p>Seal:</p>
    </div>
  );
}

export default function ProposalDocumentView({ document }: { document: ProposalDocument }) {
  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      {document.sections.map((section) => (
        <section key={section.id} className="mb-8">
          <h2 className="mb-3 border-b border-gold/20 pb-2 text-lg font-bold text-white">{section.title}</h2>
          {section.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
