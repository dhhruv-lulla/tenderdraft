import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  TableOfContents,
  WidthType,
  ShadingType,
} from "docx";
import { parseProposal } from "@/lib/parseProposal";
import type { Block, ProposalDocument } from "@/lib/proposalDocument";

const GOLD = "C9A84C";
const NAVY = "0F1C3F";
const NOTICE_FILL = "FBF3D9";
const WARNING_FILL = "FBE4E1";

function brandHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: {
          bottom: { color: GOLD, space: 4, style: BorderStyle.SINGLE, size: 6 },
        },
        children: [new TextRun({ text: "TenderDraft", bold: true, color: NAVY, size: 20 })],
      }),
    ],
  });
}

function brandFooter(companyName: string) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: companyName || "TenderDraft", size: 18, color: "888888" })],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: string[][]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          width: { size: Math.round(100 / headers.length), type: WidthType.PERCENTAGE },
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          children: [
            new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] }),
          ],
        })
    ),
  });

  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: Math.round(100 / headers.length), type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

function makeNotice(title: string, text: string, items: string[] | undefined, warning: boolean) {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: title, bold: true, color: warning ? "9A2E22" : NAVY, size: 22 })],
    }),
    new Paragraph({ spacing: { after: items && items.length > 0 ? 100 : 0 }, children: [new TextRun({ text, size: 20 })] }),
    ...(items ?? []).map(
      (item) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: item, size: 20 })] })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: warning ? WARNING_FILL : NOTICE_FILL, type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children,
          }),
        ],
      }),
    ],
  });
}

function blockToDocxChildren(block: Block): Array<Paragraph | Table> {
  switch (block.type) {
    case "heading": {
      const level =
        block.level === 1 ? HeadingLevel.HEADING_1 : block.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;
      return [new Paragraph({ text: block.text, heading: level, spacing: { before: 280, after: 140 } })];
    }
    case "paragraph":
      return [
        new Paragraph({
          children: [new TextRun({ text: block.text })],
          spacing: { after: 160 },
          alignment: AlignmentType.JUSTIFIED,
        }),
      ];
    case "bullet":
      return block.items.map(
        (item) => new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 80 } })
      );
    case "table":
      return [makeTable(block.headers, block.rows), new Paragraph({ text: "", spacing: { after: 160 } })];
    case "notice":
      return [makeNotice(block.title, block.text, block.items, block.variant === "warning"), new Paragraph({ text: "", spacing: { after: 160 } })];
    case "signature":
      return [
        new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: "For the Bidder,", bold: true })] }),
        new Paragraph({ spacing: { before: 400 }, text: "Authorised Signatory" }),
        new Paragraph({ text: "Name: ______________________" }),
        new Paragraph({ text: "Designation: ______________________" }),
        new Paragraph({ text: "Date: ______________________" }),
        new Paragraph({ text: "Seal:" }),
      ];
    default:
      return [];
  }
}

export async function generateDocxFromDocument(
  doc: ProposalDocument,
  companyName: string
): Promise<Blob> {
  const children: Array<Paragraph | Table | TableOfContents> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: companyName || "Tender Proposal", bold: true, size: 36, color: NAVY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "GeM Tender Bid Response", size: 24, color: "666666" })],
    }),
    new Paragraph({ text: "Table of Contents", heading: HeadingLevel.HEADING_1, spacing: { after: 160 } }),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({ text: "", pageBreakBefore: true }),
  ];

  for (const section of doc.sections) {
    children.push(new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 160 } }));
    for (const block of section.blocks) {
      children.push(...blockToDocxChildren(block));
    }
  }

  const document = new Document({
    features: { updateFields: true },
    sections: [
      {
        properties: {},
        headers: { default: brandHeader() },
        footers: { default: brandFooter(companyName) },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}

export async function generateProposalDocx(
  proposalText: string,
  companyName: string
): Promise<Blob> {
  const blocks = parseProposal(proposalText);

  const children: Paragraph[] = blocks.map((block) => {
    if (block.type === "heading") {
      return new Paragraph({
        text: block.text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 160 },
      });
    }

    if (block.type === "bullet") {
      return new Paragraph({
        text: block.text,
        bullet: { level: 0 },
        spacing: { after: 80 },
      });
    }

    return new Paragraph({
      children: [new TextRun({ text: block.text })],
      spacing: { after: 160 },
      alignment: AlignmentType.JUSTIFIED,
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: {
                  bottom: {
                    color: "C9A84C",
                    space: 4,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
                children: [
                  new TextRun({
                    text: "TenderDraft",
                    bold: true,
                    color: "0F1C3F",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: companyName || "TenderDraft",
                    size: 18,
                    color: "888888",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
