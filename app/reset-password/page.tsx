"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// How long to wait for Supabase's PASSWORD_RECOVERY event before concluding
// the link is missing/invalid rather than just slow to exchange.
const RECOVERY_WAIT_MS = 6000;

type LinkState = "verifying" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>(
    isSupabaseConfigured ? "verifying" : "invalid"
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();

    // Clicking the emailed reset link lands here with a recovery code in the
    // URL. Supabase's client exchanges it for a session automatically and
    // fires PASSWORD_RECOVERY once that's done - only then do we know it's
    // safe to show the "set a new password" form. If a session already
    // existed from a race (event fired before this listener attached),
    // getSession() below catches it as a fallback.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolvedRef.current = true;
        setLinkState("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!resolvedRef.current && data.session) {
        resolvedRef.current = true;
        setLinkState("ready");
      }
    });

    const timeout = setTimeout(() => {
      if (!resolvedRef.current) setLinkState("invalid");
    }, RECOVERY_WAIT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setSubmitting(false);
      setError(updateError.message);
      return;
    }

    // Don't leave them signed in on the recovery session - send them to a
    // fresh login with their new password so there's no ambiguity about
    // whether the reset "took".
    await supabase.auth.signOut();
    router.push("/login?reset=success");
  };

  if (linkState === "verifying") {
    return (
      <AuthShell title="Verifying your reset link" subtitle="This will just take a moment">
        <div className="flex flex-col items-center py-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      </AuthShell>
    );
  }

  if (linkState === "invalid") {
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
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-3 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-6px_rgba(201,168,76,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
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
