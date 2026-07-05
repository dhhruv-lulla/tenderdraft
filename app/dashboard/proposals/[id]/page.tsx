import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProposalDetailActions from "@/components/dashboard/ProposalDetailActions";
import ProposalDocumentView from "@/components/ProposalDocumentView";
import { createClient } from "@/lib/supabase/server";
import { fetchProposal } from "@/lib/supabase/db";
import { parseProposal } from "@/lib/parseProposal";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const proposal = await fetchProposal(supabase, user.id, id);

  if (!proposal) {
    notFound();
  }

  const blocks = proposal.proposalJson ? null : parseProposal(proposal.proposalText);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="glass shadow-premium mt-6 rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h1 className="text-lg font-semibold text-white">{proposal.title}</h1>
              <p className="text-xs text-white/40">
                Generated{" "}
                {new Date(proposal.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <ProposalDetailActions
              proposalText={proposal.proposalText}
              proposalJson={proposal.proposalJson}
              companyName={proposal.companyName}
            />
          </div>

          <div className="mx-auto max-w-2xl px-6 py-8 sm:px-8">
            {proposal.proposalJson ? (
              <ProposalDocumentView document={proposal.proposalJson} />
            ) : (
              blocks?.map((block, i) => {
                if (block.type === "heading") {
                  return (
                    <h2
                      key={i}
                      className="mt-8 mb-3 border-b border-gold/20 pb-2 text-lg font-bold text-gold first:mt-0"
                    >
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === "bullet") {
                  return (
                    <li key={i} className="ml-5 list-disc py-1 text-sm leading-relaxed text-white/75">
                      {block.text}
                    </li>
                  );
                }
                return (
                  <p key={i} className="py-1.5 text-sm leading-relaxed text-white/75">
                    {block.text}
                  </p>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
