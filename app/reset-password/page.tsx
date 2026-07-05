"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle, BadgeCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchCompanyProfile } from "@/lib/supabase/db";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Clicking the emailed reset link lands here with a recovery token in the
    // URL. Creating the client as early as possible (on mount, before the user
    // does anything) lets Supabase's built-in detectSessionInUrl exchange that
    // token for a temporary recovery session before handleSubmit runs.
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange(() => {});
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet. Add your project URL and anon key to .env.local to enable password resets."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      if (/session|token|expired|invalid/i.test(updateError.message)) {
        setLinkInvalid(true);
      } else {
        setError(updateError.message);
      }
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const profile = user ? await fetchCompanyProfile(supabase, user.id) : null;
    setLoading(false);
    setDone(true);

    setTimeout(() => {
      router.push(profile ? "/dashboard" : "/onboarding");
      router.refresh();
    }, 1500);
  };

  if (linkInvalid) {
    return (
      <AuthShell title="Link expired" subtitle="This password reset link is invalid or has expired">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-400/30">
            <AlertCircle className="h-6 w-6 text-red-300" strokeWidth={1.75} />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Reset links expire after a short time and can only be used once. Request a new
            one to continue.
          </p>
          <Link
            href="/forgot-password"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
          >
            Request New Link
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Taking you to your dashboard">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/30">
            <BadgeCheck className="h-6 w-6 text-gold" strokeWidth={1.75} />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            Your password has been changed successfully.
          </p>
          <Loader2 className="mt-6 h-5 w-5 animate-spin text-white/40" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">New Password</span>
          <PasswordInput
            showLockIcon
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Confirm Password</span>
          <PasswordInput
            showLockIcon
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
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
              Update Password
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
