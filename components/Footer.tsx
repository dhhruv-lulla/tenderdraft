"use client";

import Link from "next/link";
import { FileText, Mail } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

export default function Footer() {
  const { user, loading } = useSupabaseUser();

  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/10 ring-1 ring-gold/25">
              <FileText className="h-4 w-4 text-gold" strokeWidth={2.25} />
            </span>
            TenderDraft
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/55">
            <Link href="/pricing" className="transition-colors duration-200 hover:text-white">
              Pricing
            </Link>
            <Link href="/privacy" className="transition-colors duration-200 hover:text-white">
              Privacy Policy
            </Link>
            {!loading && (
              <Link
                href={user ? "/dashboard" : "/login"}
                className="transition-colors duration-200 hover:text-white"
              >
                {user ? "Dashboard" : "Log In"}
              </Link>
            )}
            <a
              href="mailto:tenderdraft@gmail.com"
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              tenderdraft@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/35">
          © {new Date().getFullYear()} TenderDraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
