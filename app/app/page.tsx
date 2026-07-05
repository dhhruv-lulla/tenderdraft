import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppWorkspace from "@/components/app/AppWorkspace";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyProfile } from "@/lib/supabase/db";

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  const profile = await fetchCompanyProfile(supabase, user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Generate a Proposal
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Upload the tender documents and we&apos;ll draft a complete response
            using your saved company profile.
          </p>
        </div>

        {profile ? (
          <AppWorkspace profile={profile} />
        ) : (
          <div className="glass shadow-premium mx-auto max-w-lg rounded-2xl p-8 text-center">
            <p className="text-sm text-white/60">
              Finish setting up your company profile before generating a
              proposal.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
            >
              Complete Setup
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
