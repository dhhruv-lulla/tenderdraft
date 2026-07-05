import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  IndianRupee,
  MessageCircle,
  ShieldCheck,
  Clock,
  Lock,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CopyUpiId from "@/components/payment/CopyUpiId";
import { UPI_ID, PAYEE_NAME, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from "@/lib/paymentConfig";

export const metadata: Metadata = {
  title: "Complete Your Payment — TenderDraft",
  description: "Scan the UPI QR code to complete your TenderDraft plan payment.",
};

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; price?: string; period?: string }>;
}) {
  const params = await searchParams;
  const planName = params.plan || "TenderDraft";
  const price = params.price || "";
  const period = params.period || "";

  const whatsappText = encodeURIComponent(
    `Hi TenderDraft, I've paid for the ${planName} plan${
      price ? ` (${price}${period})` : ""
    }. Sharing my payment screenshot to activate my plan.`
  );

  const steps = [
    { icon: QrCode, text: "Scan the QR code with any UPI app" },
    {
      icon: IndianRupee,
      text: price ? `Pay the exact amount — ${price}` : "Pay the exact amount",
    },
    {
      icon: MessageCircle,
      text: `Message us on WhatsApp at ${WHATSAPP_DISPLAY} with a screenshot to activate your plan within minutes`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-14 lg:px-8">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition-colors duration-200 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Pricing
        </Link>

        <div className="mt-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Complete Your Payment
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {planName} Plan
          </h1>
          {price && (
            <p className="mt-2 text-lg">
              <span className="text-gradient-gold font-bold">{price}</span>
              {period && <span className="text-white/50"> {period}</span>}
            </p>
          )}
        </div>

        <div className="glass shadow-premium-lg mt-10 rounded-2xl p-8 sm:p-10">
          <div className="mx-auto flex w-full max-w-xs flex-col items-center">
            <div className="rounded-2xl bg-white p-4 shadow-gold-glow ring-1 ring-gold/25">
              <Image
                src="/upi-qr.png"
                alt="UPI payment QR code"
                width={240}
                height={240}
                className="h-60 w-60 rounded-lg object-contain"
              />
            </div>
            <p className="mt-3 text-xs text-white/40">
              You&apos;ll see <span className="font-medium text-white/65">{PAYEE_NAME}</span> as the
              recipient in your UPI app — that&apos;s correct.
            </p>

            <div className="mt-6 w-full">
              <p className="text-center text-xs font-medium uppercase tracking-wide text-white/40">
                UPI ID
              </p>
              <div className="mt-2">
                <CopyUpiId upiId={UPI_ID} />
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-white/10" />

          <div className="flex flex-col gap-5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold ring-1 ring-gold/25">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-white/75">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-3.5 text-sm font-semibold text-navy shadow-premium transition-all duration-200 hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" />
            Message us on WhatsApp
          </a>

          <p className="mt-4 text-center text-xs leading-relaxed text-white/40">
            This is a direct UPI transfer you approve yourself from your own banking
            app — we never ask for your PIN, OTP, or card details.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Lock, label: "Secure Payment" },
            { icon: ShieldCheck, label: "DPDP Act 2023" },
            { icon: Clock, label: "Activated in Minutes" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-xl px-3 py-4 text-center">
              <Icon className="mx-auto h-4 w-4 text-gold" strokeWidth={1.75} />
              <p className="mt-2 text-[11px] font-medium leading-tight text-white/55">
                {label}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
