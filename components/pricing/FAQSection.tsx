import Reveal from "@/components/Reveal";

const FAQS = [
  {
    q: "How does billing work?",
    a: "Pay Per Bid is billed once per tender response, only when you generate one. Growth and Annual are billed upfront for the month or year and renew automatically until you cancel.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your company profile and tender documents are isolated per account, handled in line with India's DPDP Act 2023, and are never used to train any AI model.",
  },
  {
    q: "What is included in a tender response?",
    a: "Every response includes an Executive Summary, Company Overview, Technical Compliance, Past Experience and References, Team Credentials, Quality Certifications and Compliance, and a Declaration — formatted and ready to download as a Word document.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Growth and Annual subscriptions can be cancelled at any time and you'll retain access until the end of your current billing period. Pay Per Bid has no subscription to cancel.",
  },
];

export default function FAQSection() {
  return (
    <div className="mx-auto mt-28 max-w-3xl">
      <Reveal className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
          FAQ
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Frequently asked questions
        </h2>
      </Reveal>

      <div className="mt-10 flex flex-col gap-4">
        {FAQS.map((faq, i) => (
          <Reveal key={faq.q} delay={i * 80}>
            <div className="glass shadow-premium rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{faq.a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
