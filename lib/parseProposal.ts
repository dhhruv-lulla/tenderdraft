export type ProposalBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string };

const KNOWN_HEADINGS = new Set([
  "executive summary",
  "company overview",
  "technical compliance",
  "past experience and references",
  "team credentials",
  "quality certifications and compliance",
  "declaration",
]);

function normalizeLine(line: string): string {
  return line
    .replace(/^#+\s*/, "")
    .replace(/^\*+\s*/, "")
    .replace(/\*+$/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}

function isBullet(line: string): boolean {
  return /^[-*•]\s+/.test(line.trim());
}

export function parseProposal(proposalText: string): ProposalBlock[] {
  const lines = proposalText.split(/\r?\n/);
  const blocks: ProposalBlock[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const normalized = normalizeLine(line);

    if (KNOWN_HEADINGS.has(normalized.toLowerCase())) {
      blocks.push({ type: "heading", text: normalized });
      continue;
    }

    if (isBullet(line)) {
      blocks.push({ type: "bullet", text: line.replace(/^[-*•]\s+/, "") });
      continue;
    }

    blocks.push({ type: "paragraph", text: normalized || line });
  }

  return blocks;
}
