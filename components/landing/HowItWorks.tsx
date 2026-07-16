"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  UploadCloud,
  ScanSearch,
  Layers,
  FileDown,
  FileText,
  Link2,
  Check,
  Hash,
  IndianRupee,
  Truck,
  BadgeCheck,
  ListChecks,
  ArrowDown,
} from "lucide-react";
import { EASE_OUT, SectionHeading, FadeIn } from "@/components/landing/motion";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload your tender",
    body: "Drop in the GeM bid PDF and any linked specification URL. That is all we need to get started.",
  },
  {
    icon: ScanSearch,
    title: "Every requirement, extracted",
    body: "Bid number, dates, EMD, ePBG, MSE and MII preferences, item specs and buyer terms, pulled straight from the document.",
  },
  {
    icon: Layers,
    title: "Your bid assembles itself",
    body: "All 13 sections are built from your saved company profile. Anything missing becomes a clear placeholder, never a guess.",
  },
  {
    icon: FileDown,
    title: "Download and submit",
    body: "A formatted Word document with covering letter, compliance tables, table of contents and a pre-submission checklist.",
  },
];

/* ---------------- illustrations ---------------- */

function IlloFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex aspect-[4/3.2] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-gold/10 blur-[60px]" />
      {children}
    </div>
  );
}

function IlloUpload() {
  return (
    <IlloFrame>
      <div className="flex w-full max-w-sm flex-col items-center rounded-xl border-2 border-dashed border-gold/30 px-6 py-10">
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.15 }}
          className="relative flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-3"
        >
          <FileText className="h-5 w-5 text-gold" />
          <span className="text-sm font-medium text-white/85">GeM-Tender-2026.pdf</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.65 }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-navy"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.85 }}
          className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2"
        >
          <Link2 className="h-3.5 w-3.5 text-white/40" />
          <span className="text-xs text-white/50">Linked specification URL</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-6 text-xs text-white/35"
        >
          PDF received. Starting analysis.
        </motion.p>
      </div>
    </IlloFrame>
  );
}

const EXTRACT_CHIPS = [
  { icon: Hash, label: "Bid No. GEM/2026/B/1234" },
  { icon: IndianRupee, label: "EMD ₹50,000" },
  { icon: Truck, label: "Delivery: 30 days" },
  { icon: BadgeCheck, label: "MSE preference: Yes" },
  { icon: ListChecks, label: "42 item specifications" },
];

function IlloExtract() {
  return (
    <IlloFrame>
      <div className="flex w-full max-w-md items-center gap-6">
        {/* document being scanned */}
        <div className="relative w-2/5 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/[0.06] p-4">
          <div className="h-1.5 w-3/4 rounded-full bg-white/50" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`mt-2 h-1 rounded-full bg-white/20 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
          <motion.div
            className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-gold/25 to-transparent"
            initial={{ top: "-15%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 0.4, ease: "linear" }}
          />
          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-gold/20" />
        </div>

        {/* extracted facts */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {EXTRACT_CHIPS.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              initial={{ x: 28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.35 + i * 0.16 }}
              className="flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.08] px-3 py-1.5"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="truncate text-xs font-medium text-white/80">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </IlloFrame>
  );
}

const SECTION_NAMES = [
  "Covering Letter",
  "Important Notice",
  "Bid Reference",
  "Bidder Profile",
  "Eligibility",
  "Financial Standing",
  "Technical Offer",
  "Scope & Delivery",
  "T&C Compliance",
  "Price Schedule",
  "Documents",
  "Signature",
  "Checklist",
];

function IlloAssemble() {
  return (
    <IlloFrame>
      <div className="w-full max-w-md">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-gold-dark"
        >
          13 sections assembled
        </motion.p>
        <div className="grid grid-cols-2 gap-1.5">
          {SECTION_NAMES.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.15 + i * 0.07 }}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1.5"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[9px] font-bold text-gold">
                {i + 1}
              </span>
              <span className="truncate text-[11px] text-white/70">{name}</span>
              {(i === 5 || i === 8) && (
                <span className="ml-auto shrink-0 rounded-full bg-gold/20 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-gold">
                  fill
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </IlloFrame>
  );
}

function IlloDownload() {
  return (
    <IlloFrame>
      <div className="flex w-full max-w-sm flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
          className="w-3/4 rounded-xl border border-gold/30 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-[0_0_50px_-16px_rgba(201,168,76,0.5)]"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-gold" />
            <div>
              <p className="text-sm font-semibold text-white">Tender-Response.docx</p>
              <p className="text-[10px] text-white/40">Formatted with TOC, tables and page numbers</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {["Covering letter", "Compliance tables", "Pre-submission checklist"].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.55 + i * 0.22 }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-gold/20 text-gold"
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                </motion.span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-xs font-semibold text-navy shadow-[0_8px_24px_-6px_rgba(201,168,76,0.55)]"
        >
          <motion.span animate={{ y: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
          Download Word Document
        </motion.div>
      </div>
    </IlloFrame>
  );
}

const ILLUSTRATIONS = [IlloUpload, IlloExtract, IlloAssemble, IlloDownload];

/* ---------------- section ---------------- */

export default function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  const ActiveIllo = ILLUSTRATIONS[active];
  const isLastStep = active === STEPS.length - 1;

  // Jumps the page to the scroll position that drives the next step, since
  // this section scroll-jacks and visitors otherwise can't tell they need
  // to keep scrolling inside it to see the rest of the walkthrough.
  const scrollToStep = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const trackTop = window.scrollY + el.getBoundingClientRect().top;
    const trackHeight = el.offsetHeight;
    const v = (index + 0.5) / STEPS.length;
    const target = trackTop + v * (trackHeight - window.innerHeight);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="relative scroll-mt-16">
      {/* Desktop: scroll-driven sticky walkthrough */}
      <div ref={trackRef} className="hidden lg:block" style={{ height: `${STEPS.length * 88}vh` }}>
        <div className="relative sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center gap-16 px-8">
            <div>
              <SectionHeading
                align="left"
                kicker="How it works"
                title="From tender PDF to finished bid, in four steps"
              />

              <div className="relative mt-12 flex flex-col gap-2">
                {/* progress rail */}
                <div className="absolute bottom-4 left-[19px] top-4 w-px bg-white/10" aria-hidden>
                  <motion.div
                    className="w-full origin-top bg-gradient-to-b from-gold-light to-gold"
                    style={{ scaleY: scrollYProgress, height: "100%" }}
                  />
                </div>

                {STEPS.map((step, i) => {
                  const isActive = i === active;
                  return (
                    <div
                      key={step.title}
                      className={`relative flex gap-5 rounded-2xl py-4 pl-1 pr-4 transition-all duration-500 ${
                        isActive ? "opacity-100" : "opacity-40"
                      }`}
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-500 ${
                          isActive
                            ? "bg-gold/15 text-gold ring-gold/40 shadow-[0_0_24px_-6px_rgba(201,168,76,0.6)]"
                            : "bg-navy text-white/40 ring-white/10"
                        }`}
                      >
                        <step.icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-white">
                          <span className="mr-2 text-sm font-bold text-gold/60">0{i + 1}</span>
                          {step.title}
                        </h3>
                        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/55">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <ActiveIllo />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => scrollToStep(Math.min(active + 1, STEPS.length - 1))}
            animate={{ opacity: isLastStep ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden={isLastStep}
            tabIndex={isLastStep ? -1 : 0}
            aria-label="Scroll to next step"
            className={`group absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2.5 ${
              isLastStep ? "pointer-events-none" : ""
            }`}
          >
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/40 transition-colors duration-300 group-hover:text-gold">
              Keep scrolling
            </span>
            <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5 transition-colors duration-300 group-hover:border-gold/50">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-gold"
                animate={{ y: [0, 16, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </motion.button>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="mx-auto max-w-2xl px-6 py-24 lg:hidden">
        <SectionHeading kicker="How it works" title="From tender PDF to finished bid, in four steps" />
        <div className="mt-12 flex flex-col gap-10">
          {STEPS.map((step, i) => {
            const Illo = ILLUSTRATIONS[i];
            return (
              <FadeIn key={step.title}>
                <Illo />
                <div className="mt-5 flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                    <step.icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      <span className="mr-2 text-xs font-bold text-gold/60">0{i + 1}</span>
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{step.body}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
