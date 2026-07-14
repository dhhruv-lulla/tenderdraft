"use client";

import type { ComponentType, ReactNode } from "react";
import {
  ShieldOff,
  ScanSearch,
  ListOrdered,
  FileText,
  RefreshCw,
  Check,
  X,
} from "lucide-react";
import { FadeIn, SectionHeading } from "@/components/landing/motion";

type IconType = ComponentType<{ className?: string; strokeWidth?: number | string }>;

function BentoCard({
  className = "",
  icon: Icon,
  title,
  body,
  children,
  delay = 0,
}: {
  className?: string;
  icon: IconType;
  title: string;
  body: string;
  children?: ReactNode;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className={className}>
      <div
        className="spotlight-card card-hover glass shadow-premium group flex h-full flex-col rounded-2xl p-7 hover:border-gold/25 hover:shadow-premium-lg"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/25 transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
        {children && <div className="mt-auto pt-6">{children}</div>}
      </div>
    </FadeIn>
  );
}

const EXTRACT_TAGS = ["Bid No.", "EMD", "ePBG", "Delivery", "MSE / MII", "Specs", "Buyer terms"];

const SECTION_PREVIEW = ["Covering Letter", "Bid Reference Summary", "Technical Offer", "Price Schedule"];

export default function FeaturesBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-16 px-6 py-24 lg:px-8 lg:py-32">
      <SectionHeading
        kicker="Why TenderDraft"
        title="Built for bids that survive scrutiny"
        sub="Government buyers check everything. So does TenderDraft."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
        <BentoCard
          className="md:col-span-2 lg:col-span-4"
          icon={ShieldOff}
          title="Zero invented facts, by design"
          body="If a number is not in your documents, it does not go in your bid. Gaps become clear placeholders you can spot in seconds, instead of confident-sounding guesses that get your bid rejected."
        >
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-red-400/20 bg-red-500/[0.06] px-4 py-3">
              <X className="h-4 w-4 shrink-0 text-red-400/80" strokeWidth={2.5} />
              <span className="text-sm text-white/45 line-through decoration-red-400/50">
                Annual turnover of ₹4.2 Cr
              </span>
              <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-red-300/70">
                guessed
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-gold/30 bg-gold/[0.08] px-4 py-3">
              <Check className="h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white/85">To be filled by client</span>
              <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gold/80">
                placeholder
              </span>
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="md:col-span-2 lg:col-span-2"
          icon={ScanSearch}
          title="Reads like a bid manager"
          body="Every commercially important detail is extracted for you."
          delay={0.08}
        >
          <div className="flex flex-wrap gap-1.5">
            {EXTRACT_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-white/60 transition-colors duration-300 group-hover:border-gold/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-2"
          icon={ListOrdered}
          title="All 13 sections, in order"
          body="From covering letter to pre-submission checklist, structured the way GeM buyers expect."
          delay={0.05}
        >
          <div className="relative space-y-1.5">
            {SECTION_PREVIEW.map((name, i) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs text-white/60"
              >
                <span className="text-[10px] font-bold text-gold/60">{String(i + 1).padStart(2, "0")}</span>
                {name}
              </div>
            ))}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d1428] to-transparent" />
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-2"
          icon={FileText}
          title="A Word file you can submit"
          body="Real tables, a table of contents, headers, footers and page numbers. No reformatting before upload."
          delay={0.1}
        >
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
            <FileText className="h-5 w-5 text-gold" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">Company-Tender-Proposal.docx</p>
              <p className="text-[10px] text-white/40">TOC, compliance tables, page numbers</p>
            </div>
          </div>
        </BentoCard>

        <BentoCard
          className="lg:col-span-2"
          icon={RefreshCw}
          title="Set up once, reuse forever"
          body="Your GST, Udyam, financials, certificates and past projects are saved and pulled into every new bid."
          delay={0.15}
        >
          <div className="space-y-1.5">
            {[
              ["GST", "27ABCDE1234F1Z5"],
              ["Udyam", "UDYAM-MH-01-00000"],
              ["ISO", "9001:2015"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/35">{k}</span>
                <span className="font-mono text-[11px] text-white/60">{v}</span>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </section>
  );
}
