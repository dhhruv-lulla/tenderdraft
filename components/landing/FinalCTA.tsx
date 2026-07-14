"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/landing/motion";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-4 lg:px-8">
      <FadeIn className="relative mx-auto max-w-5xl">
        <div className="gradient-border-gold relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold/15 blur-[90px]"
            aria-hidden
          />
          <div className="bg-grid-gold pointer-events-none absolute inset-0 opacity-60" aria-hidden />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white text-balance sm:text-5xl sm:leading-[1.1]">
              Your next bid, drafted in <span className="text-gradient-gold">minutes</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
              Create your account, set up your company profile once, and turn the next
              tender into a finished Word document.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="btn-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-8 py-4 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_28px_-4px_rgba(201,168,76,0.6)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-gold/40 hover:bg-gold/5"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
