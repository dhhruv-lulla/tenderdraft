import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  BrainCircuit,
  Download,
  CheckCircle2,
  FileWarning,
  Zap,
  Lock,
  BadgeCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="animated-gradient-navy bg-noise-navy relative overflow-hidden">
        <Navbar transparentAtTop />

        {/* decorative glow orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/20 blur-[80px]" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-navy-light/40 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-[70px]" />

        {/* HERO */}
        <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-40 text-center lg:px-8 lg:pt-28">
          <div
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold shadow-[0_0_24px_-8px_rgba(201,168,76,0.4)]"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Built for Indian GeM Portal Tenders
          </div>

          <h1
            className="animate-fade-up mt-8 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Win more government contracts.{" "}
            <span className="text-gradient-gold">Write better proposals.</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-white/70"
            style={{ animationDelay: "160ms" }}
          >
            TenderDraft uses AI to turn your GeM tender documents into
            complete, professional bid responses in minutes.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-4px_rgba(201,168,76,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_12px_32px_-4px_rgba(201,168,76,0.7)]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
            >
              See How It Works
            </Link>
          </div>

          {/* Floating before/after card */}
          <div
            className="glass-dark animate-fade-up animate-float relative mt-20 w-full max-w-3xl rounded-2xl p-2 shadow-2xl shadow-black/40"
            style={{ animationDelay: "360ms" }}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.04] p-6 text-left ring-1 ring-white/5 transition-colors duration-300 hover:bg-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <FileWarning className="h-4 w-4" />
                  Before
                </div>
                <div className="mt-3 text-2xl font-bold text-white/80">
                  Hours of manual work
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  Reading dense specs, copy-pasting boilerplate, and drafting
                  section by section from scratch.
                </p>
              </div>
              <div className="rounded-xl bg-gold/[0.08] p-6 text-left ring-1 ring-gold/20 transition-colors duration-300 hover:bg-gold/[0.12]">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <Zap className="h-4 w-4" />
                  After
                </div>
                <div className="mt-3 text-2xl font-bold text-white">
                  Minutes with TenderDraft
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Upload the tender, get a structured, compliant bid response
                  ready to review and submit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURE CARDS */}
      <section className="relative z-10 mx-auto -mt-20 max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "Time Saved",
              desc: "Turn a multi-hour drafting process into a few minutes of review and polish.",
            },
            {
              icon: BadgeCheck,
              title: "Quality Output",
              desc: "Structured, formal responses written in the language procurement officers expect.",
            },
            {
              icon: Lock,
              title: "Data Privacy",
              desc: "Your documents and company data stay isolated and are never used to train AI models.",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="card-hover group glass shadow-premium rounded-2xl p-8 hover:shadow-premium-lg hover:border-gold/20">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/25 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_0_4px_rgba(201,168,76,0.12)]">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From tender to submission, in three steps
          </h2>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="pointer-events-none absolute top-8 left-0 hidden h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />
          {[
            {
              icon: UploadCloud,
              step: "01",
              title: "Upload your tender",
              desc: "Add the GeM bid document, any linked specifications, and your company profile.",
            },
            {
              icon: BrainCircuit,
              step: "02",
              title: "We analyse and draft",
              desc: "Our AI reads the requirements and writes a complete, structured technical response.",
            },
            {
              icon: Download,
              step: "03",
              title: "Download and submit",
              desc: "Export a polished Word document, review it, and submit it on the GeM portal.",
            },
          ].map(({ icon: Icon, step, title, desc }, i) => (
            <Reveal key={step} delay={i * 120} className="relative flex flex-col items-center text-center">
              <div className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold shadow-premium ring-1 ring-gold/25 ring-offset-4 ring-offset-background transition-transform duration-300 hover:scale-105">
                <Icon className="h-7 w-7" strokeWidth={1.75} />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-[10px] font-bold text-navy shadow-md">
                  {step}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-tight text-white">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
                {desc}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="animated-gradient-navy bg-noise-navy relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-[80px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Built for trust
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Enterprise-grade privacy by default
            </h2>
            <p className="mt-4 text-white/60">
              We understand that tender documents contain sensitive
              commercial information. TenderDraft is built to respect that.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "DPDP Act 2023 Compliant",
                desc: "Data handling practices aligned with India's Digital Personal Data Protection Act.",
              },
              {
                icon: CheckCircle2,
                title: "Never used for AI training",
                desc: "Your tender documents and company data are never used to train any AI model.",
              },
              {
                icon: Lock,
                title: "Enterprise API infrastructure",
                desc: "Built on secure, enterprise-grade API infrastructure with data isolation per company.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="card-hover glass-dark h-full rounded-2xl p-7 hover:bg-white/[0.09] hover:ring-1 hover:ring-gold/20">
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.75} />
                  <h3 className="mt-4 text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[80px]" />
        <Reveal className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to draft your next winning bid?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Get started for free and generate your first proposal in minutes.
          </p>
          <Link
            href="/signup"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-7 py-3.5 text-sm font-semibold text-navy shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
