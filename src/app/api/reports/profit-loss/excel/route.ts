import ExcelJS from "exceljs";
import { getReports } from "@/lib/report-data";

export async function GET() {
  const { profitLossTree, profitLoss } = await getReports();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laba Rugi");
  sheet.columns = [{ header: "Kode", key: "code", width: 16 }, { header: "Nama Akun", key: "name", width: 34 }, { header: "Saldo", key: "amount", width: 22 }];
  const add = (nodes: typeof profitLossTree, depth = 0) => nodes.forEach((node) => { sheet.addRow({ code: node.code, name: `${"  ".repeat(depth)}${node.name}`, amount: Number(node.total) }); add(node.children, depth + 1); });
  add(profitLossTree);
  sheet.addRow({}); sheet.addRow({ name: "TOTAL PENDAPATAN", amount: Number(profitLoss.revenue) }); sheet.addRow({ name: "TOTAL BEBAN", amount: Number(profitLoss.expense) }); sheet.addRow({ name: "LABA / RUGI BERSIH", amount: Number(profitLoss.netProfitLoss) });
  sheet.getColumn("amount").numFmt = '"Rp" #,##0';
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=laba-rugi.xlsx" } });
}
