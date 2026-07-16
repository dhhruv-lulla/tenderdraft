import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { LetterDocument } from "@/lib/compliance/letterDocument";
import type { ProposalHeaderInfo } from "@/lib/proposalDocument";

const GOLD = "#C9A84C";
const NAVY = "#0F1C3F";
const CERT_FILL = "#FBE4E1";

// Bold weight is set via the standard-font family name (Helvetica-Bold)
// rather than `fontWeight`, since react-pdf only synthesizes weights for
// fonts registered with multiple sources - the built-in standard fonts do
// not support fontWeight-based bolding directly.
const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", color: "#111827", lineHeight: 1.5 },
  headerRule: { borderBottomWidth: 1.5, borderBottomColor: GOLD, paddingBottom: 6, marginBottom: 4 },
  companyName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY },
  headerMeta: { fontSize: 8, color: "#666666", marginTop: 2 },
  letterheadSpace: { height: 60 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY, textAlign: "center", marginTop: 4, marginBottom: 20 },
  refLine: { textAlign: "right", marginBottom: 4 },
  dateLine: { textAlign: "right", marginBottom: 18 },
  toLine: { marginBottom: 2 },
  subject: { fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 16 },
  salutation: { marginBottom: 12 },
  paragraph: { marginBottom: 10, textAlign: "justify" },
  bulletRow: { flexDirection: "row", marginBottom: 6 },
  bulletDot: { width: 12 },
  bulletText: { flex: 1 },
  certBox: { backgroundColor: CERT_FILL, padding: 12, marginTop: 8, marginBottom: 18 },
  certTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#9A2E22", marginBottom: 4 },
  closing: { marginTop: 20, marginBottom: 20 },
  forCompany: { fontFamily: "Helvetica-Bold" },
  signatureGap: { height: 50 },
  signatureLine: { marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#888888",
  },
});

export async function generateComplianceLetterPdf(
  letter: LetterDocument,
  headerInfo: ProposalHeaderInfo
): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRule}>
          <Text style={styles.companyName}>{headerInfo.companyName}</Text>
          <Text style={styles.headerMeta}>
            GST: {headerInfo.gstNumber}   |   Udyam: {headerInfo.udyamNumber}
          </Text>
        </View>
        {/* Blank space reserved for a physical/printed letterhead. */}
        <View style={styles.letterheadSpace} />

        <Text style={styles.title}>{letter.documentName}</Text>
        <Text style={styles.refLine}>{letter.refLine}</Text>
        <Text style={styles.dateLine}>Date: {letter.signatureBlock.date}</Text>

        <Text style={styles.toLine}>To,</Text>
        {letter.toLines.map((line, i) => (
          <Text key={i} style={styles.toLine}>
            {line}
          </Text>
        ))}

        <Text style={styles.subject}>{letter.subjectLine}</Text>
        <Text style={styles.salutation}>{letter.salutation}</Text>

        {letter.paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        {(letter.bulletList ?? []).map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}

        {letter.certification && (
          <View style={styles.certBox}>
            <Text style={styles.certTitle}>Certification required: {letter.certification.authority}</Text>
            <Text>{letter.certification.note}</Text>
          </View>
        )}

        <Text style={styles.closing}>{letter.closing}</Text>
        <Text style={styles.forCompany}>For {letter.signatureBlock.company},</Text>
        <View style={styles.signatureGap} />
        <Text style={styles.signatureLine}>Name: {letter.signatureBlock.name}</Text>
        <Text style={styles.signatureLine}>Designation: {letter.signatureBlock.designation}</Text>
        <Text style={styles.signatureLine}>Date: {letter.signatureBlock.date}</Text>
        <Text style={styles.signatureLine}>Place: {letter.signatureBlock.place}</Text>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `${headerInfo.companyName} • Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
