import { NextRequest, NextResponse } from "next/server";
import { fetchUrlText } from "@/lib/fetchUrlText";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter." },
      { status: 400 }
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  try {
    const { text, sourceType } = await fetchUrlText(url);
    return NextResponse.json({ text, sourceType });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error fetching URL.";
    return NextResponse.json(
      { error: `Could not fetch the URL: ${message}` },
      { status: 502 }
    );
  }
}
