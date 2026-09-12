import { getReports } from "@/lib/report-data";
import { createFinancialReportPdf } from "@/server/reports/pdf";
import { getSessionUser } from "@/server/services/auth.service";

export async function GET(request: Request) {
  if (!await getSessionUser()) return Response.json({ message: "Sesi tidak valid" }, { status: 401 });
  const periodId = new URL(request.url).searchParams.get("period") || undefined;
  const { profitLossTree, profitLoss, periodLabel } = await getReports(periodId);
  const pdf = await createFinancialReportPdf({
    title: "LABA RUGI",
    periodLabel,
    nodes: profitLossTree,
    summary: [
      { label: "TOTAL PENDAPATAN", value: profitLoss.revenue, strong: true },
      { label: "TOTAL BEBAN", value: profitLoss.expense, strong: true },
      { label: "LABA / RUGI BERSIH", value: profitLoss.netProfitLoss, strong: true },
    ],
  });
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=laba-rugi.pdf", "Cache-Control": "private, no-store" } });
}
