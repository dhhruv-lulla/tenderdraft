import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PricingCard, { PricingTier } from "@/components/pricing/PricingCard";
import InauguralBanner from "@/components/pricing/InauguralBanner";

const TIERS: PricingTier[] = [
  {
    name: "Pay Per Bid",
    price: "₹599",
    originalPrice: "₹999",
    period: "/ tender response",
    description: "For occasional bidders who need a single response fast.",
    features: [
      "One complete tender response",
      "Word document download",
      "AI-drafted technical bid",
      "Pay only when needed",
    ],
    ctaLabel: "Get Started",
  },
  {
    name: "Growth",
    price: "₹2,999",
    originalPrice: "₹4,999",
    period: "/ month",
    description: "For manufacturers bidding on GeM tenders regularly.",
    features: [
      "Unlimited responses",
      "Saved company profile",
      "Multi-document upload",
      "Priority processing",
      "Word and PDF export",
      "Email support",
    ],
    highlighted: true,
    badge: "Most Popular",
    ctaLabel: "Get Started",
  },
  {
    name: "Annual",
    price: "₹29,999",
    originalPrice: "₹39,999",
    period: "/ year",
    description: "Best value for teams committed to a full year of bidding.",
    features: [
      "Everything in Growth",
      "Best value",
      "Locked-in pricing",
      "Priority support",
    ],
    savingsNote: "Save ₹6,000 (two months free)",
    ctaLabel: "Get Started",
  },
];

export default function PricingSection() {
  return (
    <>
      <InauguralBanner />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            cta={
              <Link
                href={{
                  pathname: "/payment",
                  query: { plan: tier.name, price: tier.price, period: tier.period },
                }}
                className={`group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-gold-light to-gold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-6px_rgba(201,168,76,0.5)] hover:-translate-y-0.5"
                    : "border border-white/15 text-white hover:border-gold/40 hover:bg-gold/5 hover:-translate-y-0.5"
                }`}
              >
                {tier.ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            }
          />
        ))}
      </div>
    </>
  );
}
