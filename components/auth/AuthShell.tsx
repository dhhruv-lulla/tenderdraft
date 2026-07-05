import Link from "next/link";
import { FileText } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="animated-gradient-navy bg-noise-navy relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/20 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-navy-light/40 blur-[90px]" />

      <Link
        href="/"
        className="group relative z-10 mb-8 flex items-center gap-2.5 text-xl font-bold tracking-tight text-gold"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold/25 to-gold/5 ring-1 ring-gold/30 transition-all duration-300 group-hover:ring-gold/60">
          <FileText className="h-[18px] w-[18px] text-gold" strokeWidth={2.25} />
        </span>
        TenderDraft
      </Link>

      <div
        className={`glass-dark animate-fade-up shadow-premium-lg relative z-10 w-full rounded-2xl p-8 sm:p-10 ${
          wide ? "max-w-xl" : "max-w-md"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
        </div>

        <div className="mt-8">{children}</div>
      </div>

      {footer && <div className="relative z-10 mt-6 text-sm text-white/50">{footer}</div>}
    </div>
  );
}
