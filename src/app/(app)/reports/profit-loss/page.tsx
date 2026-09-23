import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PeriodFilter } from "@/components/period-filter";
import { ReportTree } from "@/components/report-tree";
import { getReports } from "@/lib/report-data";
import { money } from "@/lib/money";
import { PrintButton } from "@/components/print-button";

export default async function ProfitLossPage({ searchParams }: { searchParams: Promise<{ period?: string | string[] }> }) {
  const params = await searchParams;
  const selectedPeriod = typeof params.period === "string" ? params.period : undefined;
  const { profitLossTree, profitLoss, periodId, periods, periodLabel } = await getReports(selectedPeriod);
  const pdfHref = periodId ? `/api/reports/profit-loss/pdf?period=${encodeURIComponent(periodId)}` : "/api/reports/profit-loss/pdf";
  return <AppShell title="Laba Rugi"><div className="space-y-7"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="label">Laporan keuangan</div><h2 className="mt-2 text-3xl font-bold tracking-tight">Laba Rugi</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Pendapatan dan beban pada periode terpilih.</p></div><div className="flex flex-wrap items-center gap-3"><PeriodFilter selected={periodId} periods={periods} /><Link href={pdfHref} aria-label="Unduh laporan Laba Rugi PDF" className="flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-white"><FileText size={15} />PDF</Link><Link href="/api/reports/profit-loss/excel" className="flex h-10 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--muted-foreground)]"><Download size={15} />Excel</Link><PrintButton /></div></div><div className="panel overflow-hidden"><div className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-5"><div className="label">Periode laporan</div><div className="mt-1 font-semibold">{periodLabel}</div></div><div className="p-6"><div className="mb-2 grid grid-cols-[1fr_auto] border-b-2 border-[var(--foreground)] pb-3 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]"><span>Nama akun</span><span>Saldo</span></div><ReportTree nodes={profitLossTree} /><div className="mt-7 space-y-3 border-t-2 border-[var(--foreground)] pt-5"><div className="flex justify-between font-bold"><span>Total Pendapatan</span><span className="money">{money(profitLoss.revenue)}</span></div><div className="flex justify-between font-bold"><span>Total Beban</span><span className="money">{money(profitLoss.expense)}</span></div><div className="flex justify-between rounded-md bg-[var(--muted)] px-4 py-4 text-lg font-bold text-[var(--foreground)]"><span>LABA / RUGI BERSIH</span><span className="money">{money(profitLoss.netProfitLoss)}</span></div></div></div></div></div></AppShell>;
}
