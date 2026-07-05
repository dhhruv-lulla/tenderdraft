"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, FileText, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function Navbar({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  const [scrolled, setScrolled] = useState(!transparentAtTop);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!transparentAtTop) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentAtTop]);

  const handleLogout = async () => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/privacy", label: "Privacy" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-navy/75 backdrop-blur-2xl border-b border-white/10 shadow-[0_1px_0_0_rgba(201,168,76,0.15),0_12px_32px_-16px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-gold"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold/25 to-gold/5 ring-1 ring-gold/30 transition-all duration-300 group-hover:ring-gold/60 group-hover:shadow-[0_0_20px_rgba(201,168,76,0.35)]">
            <FileText
              className="h-[18px] w-[18px] text-gold transition-transform duration-300 group-hover:scale-110"
              strokeWidth={2.25}
            />
          </span>
          <span className="transition-colors duration-300 group-hover:text-gold-light">
            TenderDraft
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition-all duration-200 hover:border-white/30 hover:bg-white/5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/50 transition-all duration-200 hover:text-white"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_16px_-2px_rgba(201,168,76,0.5)] transition-all duration-200 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_6px_24px_-2px_rgba(201,168,76,0.65)] hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-navy/95 backdrop-blur-xl px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/85"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/70"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
