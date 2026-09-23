import Link from "next/link";
import { ArrowUpRight, BarChart3, BookOpen, CircleDollarSign, FileSpreadsheet, Landmark, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/period-filter";
import { StatCard } from "@/components/stat-card";
import { getReports } from "@/lib/report-data";
import { money } from "@/lib/money";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string | string[] }> }) {
  const params = await searchParams;
  const selectedPeriod = typeof params.period === "string" ? params.period : undefined;
  const { balance, profitLoss, periodId, periods } = await getReports(selectedPeriod);
  const revenue = Number(profitLoss.revenue);
  const expense = Number(profitLoss.expense);
  const maxValue = Math.max(revenue, expense, 1);
  const ratio = revenue === 0 ? 0 : Math.round((Number(profitLoss.expense) / revenue) * 100);

  return <AppShell title="Dasbor"><div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><div className="label">Ikhtisar periode</div><h2 className="mt-2 text-3xl font-bold tracking-tight">Ringkasan keuangan</h2><p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">Pantau posisi keuangan dan ambil tindakan berikutnya dari satu tampilan.</p></div>
      <PeriodFilter selected={periodId} periods={periods} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <StatCard label="Total Aset" value={money(balance.asset)} note="Posisi aset periode berjalan" icon={Landmark} />
      <StatCard label="Total Liabilitas" value={money(balance.liability)} note="Kewajiban yang tercatat" icon={Scale} tone="blue" />
      <StatCard label="Pendapatan" value={money(profitLoss.revenue)} note="Pendapatan periode berjalan" icon={CircleDollarSign} />
      <StatCard label="Laba Bersih" value={money(profitLoss.netProfitLoss)} note="Pendapatan dikurangi beban" icon={TrendingUp} tone="blue" />
    </div>
    <div className="grid gap-4 2xl:grid-cols-[1.45fr_.75fr]">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle>Pendapatan dan beban</CardTitle><CardDescription className="mt-1">Perbandingan angka pada periode terpilih.</CardDescription></div><BarChart3 size={18} className="text-[var(--muted-foreground)]" /></CardHeader>
        <CardContent>
          <div className="mt-2 space-y-6 rounded-xl bg-[var(--muted)] p-5 sm:p-6"><div><div className="mb-2 flex items-baseline justify-between gap-4"><span className="text-sm font-medium">Pendapatan</span><strong className="money text-sm">{money(profitLoss.revenue)}</strong></div><div className="h-3 overflow-hidden rounded-full bg-[var(--card)]"><div className="h-full rounded-full bg-[var(--chart-primary)]" style={{ width: `${(revenue / maxValue) * 100}%` }} /></div></div><div><div className="mb-2 flex items-baseline justify-between gap-4"><span className="text-sm font-medium">Beban</span><strong className="money text-sm">{money(profitLoss.expense)}</strong></div><div className="h-3 overflow-hidden rounded-full bg-[var(--card)]"><div className="h-full rounded-full bg-[var(--chart-secondary)]" style={{ width: `${(expense / maxValue) * 100}%` }} /></div></div></div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--chart-primary)" }} />Pendapatan</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--chart-secondary)" }} />Beban</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Beban atas pendapatan</CardTitle><CardDescription className="mt-1">Rasio efisiensi usaha</CardDescription></div><Badge variant="outline">{ratio <= 60 ? "Sehat" : "Perlu perhatian"}</Badge></div></CardHeader>
        <CardContent><div className="flex justify-center py-4"><div className="grid h-40 w-40 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${Math.min(ratio, 100)}%, var(--muted) ${Math.min(ratio, 100)}% 100%)` }}><div className="grid h-28 w-28 place-items-center rounded-full bg-[var(--card)]"><div className="text-center"><div className="text-3xl font-bold">{ratio}%</div><div className="text-[11px] text-[var(--muted-foreground)]">Rasio beban</div></div></div></div></div><div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm"><span className="text-[var(--muted-foreground)]">Laba / rugi dihasilkan</span><strong className="money">{money(profitLoss.netProfitLoss)}</strong></div></CardContent>
      </Card>
    </div>
    <div className="grid gap-4 2xl:grid-cols-[1.1fr_.9fr]">
      <Card><CardHeader><div><CardTitle>Langkah berikutnya</CardTitle><CardDescription className="mt-1">Akses cepat ke pekerjaan yang sering digunakan.</CardDescription></div></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Link href="/entries" className="group flex min-h-24 flex-col justify-between rounded-xl border border-[var(--border)] p-4 hover:border-[var(--foreground)] hover:bg-[var(--muted)]"><FileSpreadsheet size={18} className="text-[var(--muted-foreground)]" /><span className="flex items-center justify-between gap-2 text-sm font-semibold">Input saldo<ArrowUpRight size={14} className="opacity-50 transition group-hover:opacity-100" /></span></Link><Link href="/coa" className="group flex min-h-24 flex-col justify-between rounded-xl border border-[var(--border)] p-4 hover:border-[var(--foreground)] hover:bg-[var(--muted)]"><BookOpen size={18} className="text-[var(--muted-foreground)]" /><span className="flex items-center justify-between gap-2 text-sm font-semibold">Kelola akun<ArrowUpRight size={14} className="opacity-50 transition group-hover:opacity-100" /></span></Link><Link href="/reports/profit-loss" className="group flex min-h-24 flex-col justify-between rounded-xl border border-[var(--border)] p-4 hover:border-[var(--foreground)]"><TrendingDown size={18} className="text-[var(--muted-foreground)]" /><span className="flex items-center justify-between gap-2 text-sm font-semibold">Buka Laba Rugi<ArrowUpRight size={14} className="opacity-50 transition group-hover:opacity-100" /></span></Link></CardContent></Card>
      <Card><CardHeader><CardTitle>Posisi neraca</CardTitle><CardDescription className="mt-1">Komponen utama posisi keuangan.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between border-b border-[var(--border)] pb-4"><span className="text-sm text-[var(--muted-foreground)]">Aset</span><strong className="money">{money(balance.asset)}</strong></div><div className="flex items-center justify-between border-b border-[var(--border)] pb-4"><span className="text-sm text-[var(--muted-foreground)]">Liabilitas</span><strong className="money">{money(balance.liability)}</strong></div><div className="flex items-center justify-between"><span className="text-sm text-[var(--muted-foreground)]">Ekuitas</span><strong className="money">{money(balance.equity)}</strong></div><Link href="/reports/balance-sheet" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--foreground)] hover:underline">Lihat Neraca<ArrowUpRight size={14} /></Link></CardContent></Card>
    </div>
  </div></AppShell>;
}
