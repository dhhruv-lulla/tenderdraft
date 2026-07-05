import type { Metadata } from "next";
import { ShieldCheck, Database, Trash2, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy Policy — TenderDraft",
  description:
    "How TenderDraft handles your data, DPDP Act 2023 compliance, and your rights.",
};

const sections = [
  {
    icon: ShieldCheck,
    title: "DPDP Act 2023 Compliance",
    body: "TenderDraft's data handling practices are designed to align with India's Digital Personal Data Protection Act, 2023. We collect only the information you provide to generate your tender responses, and we process it solely for that purpose.",
  },
  {
    icon: Database,
    title: "Your data is never used for AI training",
    body: "Documents you upload and details you enter about your company are used only to generate your proposal. They are never used to train, fine-tune, or improve any AI model, ours or a third party's.",
  },
  {
    icon: Building2,
    title: "Each company's data is isolated",
    body: "Your company profile, uploaded tender documents, and generated proposals are kept isolated from other organisations using TenderDraft. Data is not shared, pooled, or cross-referenced across accounts.",
  },
  {
    icon: Trash2,
    title: "Request deletion at any time",
    body: "You can request deletion of your company profile, uploaded documents, and generated content at any time by contacting us. We will remove your data from our systems promptly upon request.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <Navbar />

      <section className="mx-auto w-full max-w-4xl px-6 py-20 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
          Privacy
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          TenderDraft handles tender documents and company information for
          Indian manufacturers. This page explains how your data is
          collected, used, and protected.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="card-hover glass shadow-premium h-full rounded-2xl p-7 hover:shadow-premium-lg hover:border-gold/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/25">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h2 className="mt-5 text-base font-semibold tracking-tight text-white">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-lg font-semibold text-white">
            What data we collect
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            To generate a proposal, TenderDraft processes the company profile
            details you enter (such as company name, GST and Udyam
            registration numbers, certifications, team size, and past
            project references), the tender documents you upload, and any
            specification document URL you provide. This information is sent
            to our AI provider solely to generate your proposal text and is
            not retained for any other purpose beyond delivering the service
            to you.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-lg font-semibold text-white">
            Contact us about your data
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            For any questions about this policy, or to request deletion of
            your data, please email{" "}
            <a
              href="mailto:tenderdraft@gmail.com"
              className="font-medium text-gold underline decoration-gold/40 decoration-2 underline-offset-2 transition-colors hover:text-gold-light"
            >
              tenderdraft@gmail.com
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
