"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, MailCheck, AlertCircle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet. Add your project URL and anon key to .env.local to enable sign up."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We've sent you a confirmation link"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/30">
            <MailCheck className="h-6 w-6 text-gold" strokeWidth={1.75} />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Click the link we sent to <span className="text-white">{email}</span> to
            confirm your account, then come back and log in to set up your company
            profile.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
          >
            Go to Log In
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start drafting winning GeM tender responses in minutes"
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:text-gold-light">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-gold/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-gold/15"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-200 focus:border-gold/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-gold/15"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-3 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-6px_rgba(201,168,76,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
