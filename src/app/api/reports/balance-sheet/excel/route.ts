import ExcelJS from "exceljs";
import { getReports } from "@/lib/report-data";

export async function GET() {
  const { balanceTree, balance } = await getReports();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Neraca");
  sheet.columns = [{ header: "Kode", key: "code", width: 16 }, { header: "Nama Akun", key: "name", width: 34 }, { header: "Saldo", key: "amount", width: 22 }];
  const add = (nodes: typeof balanceTree, depth = 0) => nodes.forEach((node) => { sheet.addRow({ code: node.code, name: `${"  ".repeat(depth)}${node.name}`, amount: Number(node.total) }); add(node.children, depth + 1); });
  add(balanceTree.filter((node) => ["ASSET", "LIABILITY", "EQUITY"].includes(node.accountType)));
  sheet.addRow({}); sheet.addRow({ name: "TOTAL ASET", amount: Number(balance.asset) }); sheet.addRow({ name: "TOTAL LIABILITAS + EKUITAS", amount: Number(balance.liabilityAndEquity) });
  sheet.getColumn("amount").numFmt = '"Rp" #,##0';
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=neraca.xlsx" } });
}
