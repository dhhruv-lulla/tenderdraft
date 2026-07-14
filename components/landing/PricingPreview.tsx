"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { FadeIn, SectionHeading } from "@/components/landing/motion";

// Kept in sync with the full plans on /pricing (components/pricing/PricingSection.tsx)
const PLANS = [
  {
    name: "Pay Per Bid",
    price: "₹599",
    period: "per tender response",
    highlights: ["One complete response", "Word document download"],
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "per month",
    highlights: ["Unlimited responses", "Priority processing"],
    popular: true,
  },
  {
    name: "Annual",
    price: "₹29,999",
    period: "per year",
    highlights: ["Everything in Growth", "Save ₹6,000 (two months free)"],
  },
];

export default function PricingPreview() {
  return (
    <section id="pricing-preview" className="mx-auto max-w-7xl scroll-mt-16 px-6 py-24 lg:px-8 lg:py-32">
      <SectionHeading
        kicker="Pricing"
        title="Founding pricing, locked in forever"
        sub="Early customers keep their rate for as long as they stay subscribed, even after the inaugural offer ends."
      />

      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.08}>
            <Link
              href="/pricing"
              className={`card-hover group flex h-full flex-col rounded-2xl p-7 ${
                plan.popular
                  ? "gradient-border-gold shadow-gold-glow"
                  : "glass shadow-premium hover:border-gold/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">{plan.name}</span>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-gold-light to-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
                    <Sparkles className="h-2.5 w-2.5" />
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">{plan.price}</span>
                <span className="text-xs text-white/40">{plan.period}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {plan.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2.5} />
                    {h}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-semibold text-gold transition-colors duration-200 group-hover:text-gold-light">
                View plan details
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.25} className="mt-10 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-gold/40 hover:bg-gold/5"
        >
          Compare all plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </FadeIn>
    </section>
  );
}
