import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyProfile } from "@/lib/supabase/db";
import { createGenerationJob, type GenerationJobFile } from "@/lib/supabase/jobs";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_key_here") {
    return NextResponse.json(
      {
        error:
          "The Anthropic API key has not been configured. Add your key to .env.local as ANTHROPIC_API_KEY and restart the server.",
      },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to generate a proposal." }, { status: 401 });
  }

  const profile = await fetchCompanyProfile(supabase, user.id);
  if (!profile || !profile.companyName.trim()) {
    return NextResponse.json(
      { error: "Please complete your company profile before generating a proposal." },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one tender document (PDF) is required." },
        { status: 400 }
      );
    }

    const jobFiles: GenerationJobFile[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      jobFiles.push({ name: file.name, base64: Buffer.from(arrayBuffer).toString("base64") });
    }

    const specUrlRaw = formData.get("specUrl");
    const specUrl = typeof specUrlRaw === "string" && specUrlRaw.trim() ? specUrlRaw.trim() : null;

    const { jobId, error } = await createGenerationJob(supabase, user.id, {
      profile,
      specUrl,
      files: jobFiles,
      companyName: profile.companyName,
    });

    if (error || !jobId) {
      return NextResponse.json(
        { error: `Failed to create generation job: ${error || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error creating generation job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
