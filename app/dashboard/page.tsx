import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSummaryCard from "@/components/dashboard/ProfileSummaryCard";
import ProposalHistoryList from "@/components/dashboard/ProposalHistoryList";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyProfile, fetchProposals } from "@/lib/supabase/db";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, proposals] = await Promise.all([
    fetchCompanyProfile(supabase, user.id),
    fetchProposals(supabase, user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Your company profile and every proposal you&apos;ve generated.
            </p>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_20px_-6px_rgba(201,168,76,0.5)] transition-all duration-200 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            Generate Proposal
          </Link>
        </div>

        {profile ? (
          <ProfileSummaryCard profile={profile} />
        ) : (
          <div className="glass shadow-premium rounded-2xl p-8 text-center">
            <p className="text-sm text-white/60">
              You haven&apos;t completed your company profile yet.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
            >
              Complete Setup
            </Link>
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-white">Proposal History</h2>
          <ProposalHistoryList proposals={proposals} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
