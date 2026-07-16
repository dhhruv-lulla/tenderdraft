import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  PageNumber,
} from "docx";
import type { LetterDocument } from "@/lib/compliance/letterDocument";
import type { ProposalHeaderInfo } from "@/lib/proposalDocument";

const GOLD = "C9A84C";
const NAVY = "0F1C3F";
const CERT_FLAG_FILL = "FBE4E1";

function letterheadHeader(info: ProposalHeaderInfo) {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { color: GOLD, space: 4, style: BorderStyle.SINGLE, size: 6 } },
        children: [new TextRun({ text: info.companyName, bold: true, color: NAVY, size: 24 })],
      }),
      new Paragraph({
        spacing: { before: 40 },
        children: [
          new TextRun({ text: `GST: ${info.gstNumber}   |   Udyam: ${info.udyamNumber}`, size: 16, color: "666666" }),
        ],
      }),
      // Blank space reserved for a physical/printed letterhead below the
      // company identity line.
      new Paragraph({ text: "", spacing: { before: 200 } }),
    ],
  });
}

function letterFooter(info: ProposalHeaderInfo) {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${info.companyName}  •  Page `, size: 16, color: "888888" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888" }),
          new TextRun({ text: " of ", size: 16, color: "888888" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "888888" }),
        ],
      }),
    ],
  });
}

function certificationNotice(authority: string, note: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: CERT_FLAG_FILL, type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `Certification required: ${authority}`, bold: true, color: "9A2E22", size: 22 }),
                ],
              }),
              new Paragraph({ children: [new TextRun({ text: note, size: 20 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function generateComplianceLetterDocx(
  letter: LetterDocument,
  headerInfo: ProposalHeaderInfo
): Promise<Blob> {
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [new TextRun({ text: letter.documentName, bold: true, size: 30, color: NAVY })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 80 },
      children: [new TextRun({ text: letter.refLine, size: 20 })],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 240 },
      children: [new TextRun({ text: `Date: ${letter.signatureBlock.date}`, size: 20 })],
    }),
    new Paragraph({ text: "To,", spacing: { after: 20 } }),
    ...letter.toLines.map((line) => new Paragraph({ text: line, spacing: { after: 20 } })),
    new Paragraph({
      spacing: { before: 240, after: 240 },
      children: [new TextRun({ text: letter.subjectLine, bold: true })],
    }),
    new Paragraph({ text: letter.salutation, spacing: { after: 200 } }),
    ...letter.paragraphs.map(
      (p) =>
        new Paragraph({
          children: [new TextRun({ text: p })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180 },
        })
    ),
    ...(letter.bulletList ?? []).map(
      (item) => new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 100 } })
    ),
  ];

  if (letter.certification) {
    children.push(certificationNotice(letter.certification.authority, letter.certification.note));
    children.push(new Paragraph({ text: "", spacing: { after: 160 } }));
  }

  children.push(
    new Paragraph({ text: letter.closing, spacing: { before: 280, after: 280 } }),
    new Paragraph({ children: [new TextRun({ text: `For ${letter.signatureBlock.company},`, bold: true })] }),
    new Paragraph({ text: "", spacing: { before: 700 } }),
    new Paragraph({ text: `Name: ${letter.signatureBlock.name}` }),
    new Paragraph({ text: `Designation: ${letter.signatureBlock.designation}` }),
    new Paragraph({ text: `Date: ${letter.signatureBlock.date}` }),
    new Paragraph({ text: `Place: ${letter.signatureBlock.place}` })
  );

  const document = new Document({
    sections: [
      {
        properties: {},
        headers: { default: letterheadHeader(headerInfo) },
        footers: { default: letterFooter(headerInfo) },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
