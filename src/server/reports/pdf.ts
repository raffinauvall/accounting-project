import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { ReportNode } from "@/server/reports/calculations";
import { money } from "@/lib/money";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LOGO = fs.readFileSync(path.join(process.cwd(), "src/logo.jpeg"));

type SummaryRow = { label: string; value: string; strong?: boolean };

function flatten(nodes: ReportNode[], depth = 0): Array<ReportNode & { depth: number }> {
  return nodes.flatMap((node) => [{ ...node, depth }, ...flatten(node.children, depth + 1)]);
}

function drawWatermark(doc: PDFKit.PDFDocument) {
  doc.save().opacity(0.045).circle(PAGE_WIDTH / 2, PAGE_HEIGHT / 2, 175).clip().image(LOGO, PAGE_WIDTH / 2 - 175, PAGE_HEIGHT / 2 - 175, { width: 350, height: 350 }).restore();
}

function drawHeader(doc: PDFKit.PDFDocument, title: string, periodLabel: string) {
  drawWatermark(doc);
  doc.fillColor("#111111").font("Helvetica-Bold").fontSize(10).text("ARVI CREATION", MARGIN, 42);
  doc.fillColor("#6b7785").font("Helvetica").fontSize(8).text("LAPORAN KEUANGAN", MARGIN, 57);
  doc.save().circle(PAGE_WIDTH - MARGIN - 24, 60, 24).clip().image(LOGO, PAGE_WIDTH - MARGIN - 48, 36, { width: 48, height: 48 }).restore();
  doc.fillColor("#111111").font("Helvetica-Bold").fontSize(21).text(title, MARGIN, 91);
  doc.fillColor("#52606d").font("Helvetica").fontSize(9).text(`Periode: ${periodLabel}`, MARGIN, 120);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`, 360, 120, { width: CONTENT_WIDTH - 312, align: "right" });
  doc.strokeColor("#111111").lineWidth(1).moveTo(MARGIN, 143).lineTo(PAGE_WIDTH - MARGIN, 143).stroke();
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  doc.fillColor("#111111").rect(MARGIN, y, CONTENT_WIDTH, 24).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8).text("KODE", MARGIN + 10, y + 8);
  doc.text("NAMA AKUN", MARGIN + 78, y + 8);
  doc.text("SALDO", MARGIN + 390, y + 8, { width: 90, align: "right" });
  return y + 24;
}

function drawRows(doc: PDFKit.PDFDocument, rows: Array<ReportNode & { depth: number }>, title: string, periodLabel: string, y: number) {
  let currentY = y;
  for (const [index, row] of rows.entries()) {
    if (currentY + 23 > PAGE_HEIGHT - 54) {
      doc.addPage();
      drawHeader(doc, title, periodLabel);
      currentY = drawTableHeader(doc, 165);
    }
    if (index % 2 === 0) doc.fillColor("#f7f9fb").rect(MARGIN, currentY, CONTENT_WIDTH, 23).fill();
    doc.fillColor("#111111").font(row.children.length ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).text(row.code, MARGIN + 10, currentY + 7);
    doc.text(row.name, MARGIN + 78 + row.depth * 12, currentY + 7, { width: 290 - row.depth * 12, ellipsis: true });
    doc.text(money(row.total), MARGIN + 300, currentY + 7, { width: 180, align: "right" });
    currentY += 23;
  }
  return currentY;
}

export async function createFinancialReportPdf(input: { title: string; periodLabel: string; nodes: ReportNode[]; summary: SummaryRow[] }) {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  drawHeader(doc, input.title, input.periodLabel);
  let y = drawTableHeader(doc, 165);
  y = drawRows(doc, flatten(input.nodes), input.title, input.periodLabel, y);
  if (y + input.summary.length * 25 + 30 > PAGE_HEIGHT - 54) {
    doc.addPage();
    drawHeader(doc, input.title, input.periodLabel);
    y = 165;
  }
  y += 12;
  for (const row of input.summary) {
    doc.fillColor(row.strong ? "#111111" : "#52606d").font(row.strong ? "Helvetica-Bold" : "Helvetica").fontSize(row.strong ? 10 : 8.5).text(row.label, MARGIN + 300, y, { width: 130 });
    doc.text(money(row.value), MARGIN + 300, y, { width: 180, align: "right" });
    y += 25;
  }

  const pages = doc.bufferedPageRange();
  for (let index = 0; index < pages.count; index += 1) {
    doc.switchToPage(index);
    doc.fillColor("#8a96a3").font("Helvetica").fontSize(7).text(`ARVI CREATION · ${input.title}`, MARGIN, PAGE_HEIGHT - MARGIN - 12);
    doc.text(`Halaman ${index + 1} dari ${pages.count}`, PAGE_WIDTH - MARGIN - 120, PAGE_HEIGHT - MARGIN - 12, { width: 120, align: "right" });
  }
  doc.end();
  return result;
}
