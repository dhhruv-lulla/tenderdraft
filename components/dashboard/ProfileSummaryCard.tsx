import Link from "next/link";
import { Building2, PencilLine } from "lucide-react";
import type { CompanyProfile } from "@/lib/types";

export default function ProfileSummaryCard({ profile }: { profile: CompanyProfile }) {
  const fields = [
    { label: "Years in Operation", value: profile.yearsInOperation },
    { label: "Team Size", value: profile.teamSize },
    { label: "GST Number", value: profile.gstNumber },
    { label: "Udyam Registration", value: profile.udyamNumber },
  ];

  return (
    <div className="glass shadow-premium rounded-2xl p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/25">
            <Building2 className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">{profile.companyName}</h2>
            <p className="text-xs text-white/40">Company Profile</p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5"
        >
          <PencilLine className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {fields.map((f) => (
          <div key={f.label} className="rounded-lg bg-white/[0.04] px-3.5 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
              {f.label}
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-white">
              {f.value || "—"}
            </div>
          </div>
        ))}
      </div>

      {profile.servicesOffered && (
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
            Services Offered
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-white/70">
            {profile.servicesOffered}
          </p>
        </div>
      )}

      {profile.pastProjects.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
            Past Projects ({profile.pastProjects.length})
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {profile.pastProjects.map((p, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/70"
              >
                <span className="font-medium text-white">{p.client}</span>
                {p.delivered && <span> — {p.delivered}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
