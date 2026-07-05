import { extractPdfText } from "@/lib/pdf";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchUrlText(
  rawUrl: string
): Promise<{ text: string; sourceType: "pdf" | "text" }> {
  const parsed = new URL(rawUrl);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  const res = await fetch(parsed.toString(), {
    headers: {
      "User-Agent": "TenderDraft/1.0 (+tenderdraft@gmail.com)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL (status ${res.status}).`);
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/pdf")) {
    const arrayBuffer = await res.arrayBuffer();
    const text = await extractPdfText(Buffer.from(arrayBuffer));
    return { text, sourceType: "pdf" };
  }

  const raw = await res.text();
  const text = contentType.includes("text/html") ? stripHtml(raw) : raw.trim();

  return { text, sourceType: "text" };
}
