"use client";

import Link from "next/link";
import { ShieldCheck, EyeOff, Lock, FileCheck2, ArrowRight } from "lucide-react";
import { FadeIn, SectionHeading } from "@/components/landing/motion";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "DPDP Act 2023 aligned",
    body: "Data handling built around India's Digital Personal Data Protection Act.",
  },
  {
    icon: EyeOff,
    title: "Never used to train AI",
    body: "Your tender documents and company data are never used to train any AI model.",
  },
  {
    icon: Lock,
    title: "Isolated per account",
    body: "Row-level security keeps every company's documents and data completely separate.",
  },
  {
    icon: FileCheck2,
    title: "You approve every fact",
    body: "Placeholders and checklists make sure nothing leaves without your sign-off.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="animated-gradient-navy bg-noise-navy relative scroll-mt-16 overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-gold/10 blur-[90px]" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-navy-light/50 blur-[80px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <SectionHeading
          kicker="Trust and privacy"
          title="Your tender data is your business"
          sub="Tender documents carry sensitive commercial information. TenderDraft is built to treat them that way."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.08}>
              <div className="card-hover glass-dark h-full rounded-2xl p-7 hover:bg-white/[0.07] hover:ring-1 hover:ring-gold/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 ring-1 ring-gold/25">
                  <pillar.icon className="h-[18px] w-[18px] text-gold" strokeWidth={1.9} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{pillar.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-10 text-center">
          <Link
            href="/privacy"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors duration-200 hover:text-gold-light"
          >
            Read our privacy policy
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
