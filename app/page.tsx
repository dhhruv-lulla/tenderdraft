import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LandingShell } from "@/components/landing/motion";
import Hero from "@/components/landing/Hero";
import StatsStrip from "@/components/landing/StatsStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesBento from "@/components/landing/FeaturesBento";
import TrustSection from "@/components/landing/TrustSection";
import PricingPreview from "@/components/landing/PricingPreview";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <LandingShell>
        <div className="animated-gradient-navy bg-noise-navy relative">
          <Navbar transparentAtTop />
          <Hero />
        </div>
        <StatsStrip />
        <HowItWorks />
        <FeaturesBento />
        <TrustSection />
        <PricingPreview />
        <FinalCTA />
      </LandingShell>
      <Footer />
    </div>
  );
}
