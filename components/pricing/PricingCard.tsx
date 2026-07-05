import { Check } from "lucide-react";
import type { ReactNode } from "react";

export interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  savingsNote?: string;
  ctaLabel: string;
}

export default function PricingCard({
  tier,
  cta,
}: {
  tier: PricingTier;
  cta: ReactNode;
}) {
  const { name, price, originalPrice, period, description, features, highlighted, badge, savingsNote } =
    tier;

  return (
    <div
      className={`card-hover relative flex flex-col rounded-2xl p-8 ${
        highlighted
          ? "gradient-border-gold shadow-gold-glow scale-[1.03]"
          : "glass shadow-premium hover:shadow-premium-lg hover:border-gold/20"
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 py-1 text-xs font-bold tracking-wide text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_4px_16px_-4px_rgba(201,168,76,0.6)]">
          {badge}
        </span>
      )}

      <h3 className="text-base font-semibold text-white">{name}</h3>
      <p className="mt-1.5 text-sm text-white/55">{description}</p>

      <div className="mt-6 flex items-baseline gap-2">
        {originalPrice && (
          <span className="text-lg font-medium text-white/30 line-through">
            {originalPrice}
          </span>
        )}
        <span className="text-4xl font-bold tracking-tight text-white">{price}</span>
        <span className="text-sm text-white/45">{period}</span>
      </div>

      {savingsNote && (
        <p className="mt-1.5 text-xs font-semibold text-gold">{savingsNote}</p>
      )}

      <ul className="mt-7 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
            <span
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                highlighted ? "bg-gold/20 text-gold" : "bg-white/5 text-white/40"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8">{cta}</div>
    </div>
  );
}
