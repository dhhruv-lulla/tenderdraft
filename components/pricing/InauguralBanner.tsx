import { Sparkles } from "lucide-react";

export default function InauguralBanner() {
  return (
    <div className="relative mx-auto mb-16 max-w-3xl">
      <div className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-[2rem] bg-gold/10 blur-2xl" />
      <div className="gradient-border-gold shadow-gold-glow relative overflow-hidden rounded-2xl px-8 py-7 text-center">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-gold/20 blur-3xl" />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 py-1.5 text-xs font-bold tracking-wide text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_4px_16px_-4px_rgba(201,168,76,0.6)]">
          <Sparkles className="h-3.5 w-3.5" />
          Inaugural Offer • Limited Time
        </span>

        <p className="relative mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
          Early customers get special{" "}
          <span className="font-semibold text-white">founding pricing</span>,
          locked in forever, even after the offer ends. Join now to secure
          your rate for as long as you stay subscribed.
        </p>
      </div>
    </div>
  );
}
