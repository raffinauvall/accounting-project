import { getReports } from "@/lib/report-data";
import { createFinancialReportPdf } from "@/server/reports/pdf";
import { getSessionUser } from "@/server/services/auth.service";

export async function GET(request: Request) {
  if (!await getSessionUser()) return Response.json({ message: "Sesi tidak valid" }, { status: 401 });
  const periodId = new URL(request.url).searchParams.get("period") || undefined;
  const { balanceTree, balance, periodLabel } = await getReports(periodId);
  const pdf = await createFinancialReportPdf({
    title: "NERACA",
    periodLabel,
    nodes: balanceTree.filter((node) => ["ASSET", "LIABILITY", "EQUITY"].includes(node.accountType)),
    summary: [
      { label: "TOTAL ASET", value: balance.asset, strong: true },
      { label: "TOTAL LIABILITAS + EKUITAS", value: balance.liabilityAndEquity, strong: true },
      { label: "SELISIH", value: balance.difference },
    ],
  });
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=neraca.pdf", "Cache-Control": "private, no-store" } });
}
