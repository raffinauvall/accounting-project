import ExcelJS from "exceljs";
import { getSessionUser } from "@/server/services/auth.service";

const headers = ["No", "Kode Project", "Nama Project", "Tanggal", "No. Bukti", "Jenis Transaksi", "No. Penawaran", "No. Invoice", "Customer", "Keterangan", "Kategori", "Nomor Akun", "Nama Akun", "Deskripsi", "Kredit", "Debet"];

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF138B82" } };
  row.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
}

export async function GET() {
  if (!await getSessionUser()) return Response.json({ message: "Sesi tidak valid" }, { status: 401 });
  const workbook = new ExcelJS.Workbook();
  const journal = workbook.addWorksheet("JURNAL UMUM");
  journal.mergeCells("A1:P1");
  journal.getCell("A1").value = "Template Import Jurnal Umum";
  journal.getCell("A2").value = "Isi data mulai baris 6. Nomor Akun harus diisi; isi salah satu kolom Kredit atau Debet.";
  headers.forEach((header, index) => { journal.getCell(5, index + 1).value = header; });
  styleHeader(journal.getRow(5));
  journal.getRow(6).values = [];
  journal.getColumn(4).numFmt = "dd/mm/yyyy";
  journal.getColumn(15).numFmt = '#,##0.00';
  journal.getColumn(16).numFmt = '#,##0.00';
  journal.columns.forEach((column, index) => { column.width = [8, 16, 20, 14, 16, 18, 18, 18, 20, 22, 18, 16, 24, 30, 16, 16][index]; });
  journal.views = [{ state: "frozen", ySplit: 5 }];

  const setup = workbook.addWorksheet("SETUP");
  setup.mergeCells("A1:F1");
  setup.getCell("A1").value = "Setup Akun (opsional)";
  setup.getCell("A2").value = "Isi mulai baris 6 jika ingin membuat akun baru saat import.";
  ["", "", "", "Nama Akun", "Nomor Akun", "Kategori"].forEach((header, index) => { setup.getCell(5, index + 1).value = header; });
  styleHeader(setup.getRow(5));
  setup.getRow(6).values = [];
  setup.columns.forEach((column, index) => { column.width = [4, 4, 4, 30, 16, 20][index]; });
  setup.views = [{ state: "frozen", ySplit: 5 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=template-jurnal-umum.xlsx", "Cache-Control": "private, no-store" } });
}
