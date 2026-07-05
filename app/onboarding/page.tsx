"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  BadgeCheck,
  LayoutDashboard,
  IndianRupee,
  Landmark,
} from "lucide-react";
import StepIndicator from "@/components/onboarding/StepIndicator";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchCompanyProfile, saveCompanyProfile } from "@/lib/supabase/db";
import { CompanyProfile, emptyProfile, PastProject, FinancialYear, BoardMember } from "@/lib/types";

const STEPS = [
  "Company Basics",
  "Registration",
  "Financial Standing",
  "Legal & Banking",
  "Past Projects",
];
const MAX_PROJECTS = 5;
const MAX_BOARD_MEMBERS = 10;

function currentFinancialYearLabels(): string[] {
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return [0, 1, 2].map((back) => {
    const start = fyStartYear - back;
    return `FY ${start}-${String((start + 1) % 100).padStart(2, "0")}`;
  });
}

function inputClass() {
  return "w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200 focus:border-gold/50 focus:ring-2 focus:ring-gold/15";
}

function skipButtonClass() {
  return "text-xs font-medium text-white/40 underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-white/70";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const existing = await fetchCompanyProfile(supabase, data.user.id);
      if (existing) {
        setProfile(
          existing.financials.length > 0
            ? existing
            : {
                ...existing,
                financials: currentFinancialYearLabels().map((year) => ({
                  year,
                  turnover: "",
                  profitAfterTax: "",
                })),
              }
        );
      } else {
        setProfile((prev) => ({
          ...prev,
          financials: currentFinancialYearLabels().map((year) => ({ year, turnover: "", profitAfterTax: "" })),
        }));
      }
    });
  }, []);

  const setField = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateProject = (index: number, patch: Partial<PastProject>) => {
    setProfile((prev) => ({
      ...prev,
      pastProjects: prev.pastProjects.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  };

  const addProject = () => {
    if (profile.pastProjects.length >= MAX_PROJECTS) return;
    setField("pastProjects", [...profile.pastProjects, { client: "", delivered: "", outcome: "" }]);
  };

  const removeProject = (index: number) => {
    setField("pastProjects", profile.pastProjects.filter((_, i) => i !== index));
  };

  const updateFinancialYear = (index: number, patch: Partial<FinancialYear>) => {
    setProfile((prev) => ({
      ...prev,
      financials: prev.financials.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const updateBoardMember = (index: number, patch: Partial<BoardMember>) => {
    setProfile((prev) => ({
      ...prev,
      boardOfDirectors: prev.boardOfDirectors.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  const addBoardMember = () => {
    if (profile.boardOfDirectors.length >= MAX_BOARD_MEMBERS) return;
    setField("boardOfDirectors", [...profile.boardOfDirectors, { name: "", designation: "" }]);
  };

  const removeBoardMember = (index: number) => {
    setField("boardOfDirectors", profile.boardOfDirectors.filter((_, i) => i !== index));
  };

  const canProceedFromStepA = profile.companyName.trim().length > 0;

  const handleNext = () => {
    setError(null);
    if (step === 0 && !canProceedFromStepA) {
      setError("Company name is required.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet. Add your project URL and anon key to .env.local, then restart the server."
      );
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      setError("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    const { error: saveError } = await saveCompanyProfile(supabase, user.id, profile);
    setSaving(false);

    if (saveError) {
      setError(saveError);
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="glass shadow-premium-lg animate-fade-up w-full max-w-lg rounded-2xl p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/25 shadow-gold-glow">
            <BadgeCheck className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
            You&apos;re all set!
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            Your company profile has been saved. It will load automatically every
            time you sign in, so you never have to re-enter it.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-3 text-sm font-semibold text-navy shadow-premium transition-all duration-200 hover:-translate-y-0.5"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-dark">
            <Sparkles className="h-3 w-3" />
            One-time setup
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Set up your company profile
          </h1>
          <p className="mt-2 text-sm text-white/55">
            This takes about two minutes and powers every proposal we generate for you.
          </p>
        </div>

        <div className="mt-10">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        <div className="glass shadow-premium animate-fade-up mt-10 rounded-2xl p-7 sm:p-9">
          {error && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
                  <Building2 className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-base font-semibold text-white">Company Basics</h2>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-white/55">Company Name</span>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  placeholder="Acme Manufacturing Pvt. Ltd."
                  className={inputClass()}
                />
              </label>

              <div className="grid grid-cols-2 gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">Years in Operation</span>
                  <input
                    type="number"
                    min={0}
                    value={profile.yearsInOperation}
                    onChange={(e) => setField("yearsInOperation", e.target.value)}
                    placeholder="12"
                    className={inputClass()}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">Team Size</span>
                  <input
                    type="number"
                    min={0}
                    value={profile.teamSize}
                    onChange={(e) => setField("teamSize", e.target.value)}
                    placeholder="45"
                    className={inputClass()}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-white/55">Services Offered</span>
                <textarea
                  rows={3}
                  value={profile.servicesOffered}
                  onChange={(e) => setField("servicesOffered", e.target.value)}
                  placeholder="Precision sheet metal fabrication, CNC machining, powder coating..."
                  className={inputClass()}
                />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
                  <BadgeCheck className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-base font-semibold text-white">Registration &amp; Certifications</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">GST Number</span>
                  <input
                    type="text"
                    value={profile.gstNumber}
                    onChange={(e) => setField("gstNumber", e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className={inputClass()}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">Udyam Registration Number</span>
                  <input
                    type="text"
                    value={profile.udyamNumber}
                    onChange={(e) => setField("udyamNumber", e.target.value)}
                    placeholder="UDYAM-MH-01-0000000"
                    className={inputClass()}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-white/55">Certifications</span>
                <textarea
                  rows={3}
                  value={profile.certifications}
                  onChange={(e) => setField("certifications", e.target.value)}
                  placeholder="ISO 9001, BIS, etc"
                  className={inputClass()}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
                  <IndianRupee className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-base font-semibold text-white">Financial Standing</h2>
              </div>
              <p className="text-xs text-white/45">
                Used to fill the Financial Standing table in your bids. Not sure of exact figures right now?
                It&apos;s completely fine to leave these blank and add them later.
              </p>

              <div className="flex flex-col gap-3">
                {profile.financials.map((fy, index) => (
                  <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                      {fy.year || `Financial Year ${index + 1}`}
                    </span>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={fy.turnover}
                        onChange={(e) => updateFinancialYear(index, { turnover: e.target.value })}
                        placeholder="Annual Turnover (INR)"
                        className={inputClass()}
                      />
                      <input
                        type="text"
                        value={fy.profitAfterTax}
                        onChange={(e) => updateFinancialYear(index, { profitAfterTax: e.target.value })}
                        placeholder="Profit After Tax (INR)"
                        className={inputClass()}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">Net Worth</span>
                  <input
                    type="text"
                    value={profile.netWorth}
                    onChange={(e) => setField("netWorth", e.target.value)}
                    placeholder="INR 2,50,00,000"
                    className={inputClass()}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">Total Assets</span>
                  <input
                    type="text"
                    value={profile.totalAssets}
                    onChange={(e) => setField("totalAssets", e.target.value)}
                    placeholder="INR 4,00,00,000"
                    className={inputClass()}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
                  <Landmark className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-base font-semibold text-white">Legal &amp; Banking</h2>
              </div>
              <p className="text-xs text-white/45">
                Powers the Bidder Profile and Documents Checklist sections. Skip anything you don&apos;t have
                on hand — you can always fill it in later from your dashboard.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">CIN</span>
                  <input
                    type="text"
                    value={profile.cin}
                    onChange={(e) => setField("cin", e.target.value)}
                    placeholder="U12345MH2010PTC123456"
                    className={inputClass()}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-white/55">PAN</span>
                  <input
                    type="text"
                    value={profile.pan}
                    onChange={(e) => setField("pan", e.target.value)}
                    placeholder="ABCDE1234F"
                    className={inputClass()}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-white/55">Registered Address</span>
                <textarea
                  rows={2}
                  value={profile.registeredAddress}
                  onChange={(e) => setField("registeredAddress", e.target.value)}
                  placeholder="Registered office address as per incorporation documents"
                  className={inputClass()}
                />
              </label>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                  Bank Details
                </span>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={profile.bankDetails.accountName}
                    onChange={(e) =>
                      setField("bankDetails", { ...profile.bankDetails, accountName: e.target.value })
                    }
                    placeholder="Account Holder Name"
                    className={inputClass()}
                  />
                  <input
                    type="text"
                    value={profile.bankDetails.accountNumber}
                    onChange={(e) =>
                      setField("bankDetails", { ...profile.bankDetails, accountNumber: e.target.value })
                    }
                    placeholder="Account Number"
                    className={inputClass()}
                  />
                  <input
                    type="text"
                    value={profile.bankDetails.ifsc}
                    onChange={(e) => setField("bankDetails", { ...profile.bankDetails, ifsc: e.target.value })}
                    placeholder="IFSC Code"
                    className={inputClass()}
                  />
                  <input
                    type="text"
                    value={profile.bankDetails.bankName}
                    onChange={(e) =>
                      setField("bankDetails", { ...profile.bankDetails, bankName: e.target.value })
                    }
                    placeholder="Bank Name"
                    className={inputClass()}
                  />
                  <input
                    type="text"
                    value={profile.bankDetails.branch}
                    onChange={(e) => setField("bankDetails", { ...profile.bankDetails, branch: e.target.value })}
                    placeholder="Branch"
                    className={inputClass()}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                  Board of Directors ({profile.boardOfDirectors.length}/{MAX_BOARD_MEMBERS})
                </span>
                <button
                  type="button"
                  onClick={addBoardMember}
                  disabled={profile.boardOfDirectors.length >= MAX_BOARD_MEMBERS}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Member
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {profile.boardOfDirectors.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateBoardMember(index, { name: e.target.value })}
                      placeholder="Name"
                      className={inputClass()}
                    />
                    <input
                      type="text"
                      value={member.designation}
                      onChange={(e) => updateBoardMember(index, { designation: e.target.value })}
                      placeholder="Designation"
                      className={inputClass()}
                    />
                    <button
                      type="button"
                      onClick={() => removeBoardMember(index)}
                      className="shrink-0 rounded-md p-1.5 text-white/40 transition-colors duration-200 hover:text-red-400"
                      aria-label="Remove board member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/25">
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h2 className="text-base font-semibold text-white">
                    Past Projects{" "}
                    <span className="font-normal text-white/40">
                      ({profile.pastProjects.length}/{MAX_PROJECTS})
                    </span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  disabled={profile.pastProjects.length >= MAX_PROJECTS}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Project
                </button>
              </div>

              {profile.pastProjects.length === 0 && (
                <p className="rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/40">
                  Optional, but strongly recommended. Add up to {MAX_PROJECTS} past
                  projects to strengthen your proposals.
                </p>
              )}

              <div className="flex flex-col gap-4">
                {profile.pastProjects.map((project, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                        Project {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white/40 transition-colors duration-200 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={project.client}
                        onChange={(e) => updateProject(index, { client: e.target.value })}
                        placeholder="Client or Buyer Name"
                        className={inputClass()}
                      />
                      <input
                        type="text"
                        value={project.delivered}
                        onChange={(e) => updateProject(index, { delivered: e.target.value })}
                        placeholder="What Was Delivered"
                        className={inputClass()}
                      />
                      <input
                        type="text"
                        value={project.outcome}
                        onChange={(e) => updateProject(index, { outcome: e.target.value })}
                        placeholder="Outcome or Result"
                        className={inputClass()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-6">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <div className="flex items-center gap-4">
              {(step === 2 || step === 3) && (
                <button type="button" onClick={handleNext} className={skipButtonClass()}>
                  Skip — not available yet
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-navy transition-all duration-200 hover:-translate-y-0.5"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-navy shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-6px_rgba(201,168,76,0.5)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
