import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/pricing/PricingSection";
import FAQSection from "@/components/pricing/FAQSection";

export const metadata: Metadata = {
  title: "Pricing — TenderDraft",
  description: "Simple, transparent pricing for GeM tender response generation.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[80px]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
              Pricing
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-white/60">
              Whether you bid occasionally or every week, there&apos;s a plan
              that fits. No hidden fees, ever.
            </p>
          </div>

          <div className="mt-14">
            <PricingSection />
          </div>

          <FAQSection />
        </div>
      </section>

      <Footer />
    </div>
  );
}
