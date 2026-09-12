import Link from "next/link";
import { ArrowUpRight, BarChart3, Calculator, CircleDollarSign, Landmark, ReceiptText, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodFilter } from "@/components/period-filter";
import { StatCard } from "@/components/stat-card";
import { getReports } from "@/lib/report-data";
import { money } from "@/lib/money";

const monthly = [28, 36, 31, 46, 42, 58, 50, 68, 61, 76, 72, 84];
const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const contracts = [["ASE Certification", "Rp 28.500.000"], ["Training Fleet Management", "Rp 18.750.000"], ["Audit Workshop", "Rp 14.200.000"], ["Service Excellence", "Rp 9.850.000"]];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string | string[] }> }) {
  const params = await searchParams;
  const selectedPeriod = typeof params.period === "string" ? params.period : undefined;
  const { balance, profitLoss, periodId, periods } = await getReports(selectedPeriod);
  const revenue = Number(profitLoss.revenue);
  const ratio = revenue === 0 ? 0 : Math.round((Number(profitLoss.expense) / revenue) * 100);

  return <AppShell title="Dasbor"><div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><div className="label">Overview</div><h2 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Pantau kondisi keuangan dan aktivitas bisnis dalam satu tampilan.</p></div>
      <PeriodFilter selected={periodId} periods={periods} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <StatCard label="Total Pendapatan" value={money(profitLoss.revenue)} note="Pendapatan periode berjalan" icon={CircleDollarSign} />
      <StatCard label="Total HPP" value={money("0")} note="Belum ada akun HPP terpetakan" icon={Calculator} tone="slate" />
      <StatCard label="Total Beban" value={money(profitLoss.expense)} note="Beban periode berjalan" icon={TrendingDown} tone="orange" />
      <StatCard label="Laba Bersih Usaha" value={money(profitLoss.netProfitLoss)} note="Pendapatan dikurangi beban" icon={TrendingUp} tone="blue" />
      <StatCard label="Total Aset" value={money(balance.asset)} note="Posisi aset periode berjalan" icon={Landmark} />
      <StatCard label="Total Liabilitas" value={money(balance.liability)} note="Kewajiban yang tercatat" icon={Scale} tone="blue" />
      <StatCard label="Total Ekuitas" value={money(balance.equity)} note="Modal dan laba ditahan" icon={ReceiptText} tone="slate" />
    </div>
    <div className="grid gap-4 2xl:grid-cols-[1.45fr_.75fr]">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle>Penjualan dan beban usaha</CardTitle><CardDescription className="mt-1">Performa relatif per bulan dalam satu tahun.</CardDescription></div><BarChart3 size={18} className="text-[var(--muted-foreground)]" /></CardHeader>
        <CardContent>
          <div className="relative mt-2 h-60 border-b border-l border-[var(--border)] bg-[linear-gradient(to_bottom,transparent_24%,var(--chart-grid)_25%,transparent_26%,transparent_49%,var(--chart-grid)_50%,transparent_51%,transparent_74%,var(--chart-grid)_75%,transparent_76%)] px-2 sm:px-4"><div className="flex h-full min-w-0 items-end gap-1.5 sm:gap-3">{monthly.map((height, index) => <div className="group flex h-full min-w-0 flex-1 items-end gap-0.5" key={months[index]}><div className="chart-bar w-1/2 rounded-t-sm" style={{ backgroundColor: "var(--chart-primary)", height: `${height}%` }} /><div className="chart-bar w-1/2 rounded-t-sm" style={{ backgroundColor: "var(--chart-secondary)", height: `${Math.max(10, height - 18)}%` }} /></div>)}</div></div>
          <div className="mt-3 flex justify-between pl-2 text-[10px] text-[var(--muted-foreground)] sm:pl-4">{months.map((month) => <span key={month}>{month}</span>)}</div>
          <div className="mt-5 flex gap-5 text-xs text-[var(--muted-foreground)]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--chart-primary)" }} />Pendapatan</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--chart-secondary)" }} />Beban usaha</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Beban atas pendapatan</CardTitle><CardDescription className="mt-1">Rasio efisiensi usaha</CardDescription></div><Badge variant="outline">{ratio <= 60 ? "Sehat" : "Perlu perhatian"}</Badge></div></CardHeader>
        <CardContent><div className="flex justify-center py-4"><div className="grid h-40 w-40 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${Math.min(ratio, 100)}%, var(--muted) ${Math.min(ratio, 100)}% 100%)` }}><div className="grid h-28 w-28 place-items-center rounded-full bg-[var(--card)]"><div className="text-center"><div className="text-3xl font-bold">{ratio}%</div><div className="text-[11px] text-[var(--muted-foreground)]">Rasio beban</div></div></div></div></div><div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm"><span className="text-[var(--muted-foreground)]">Laba / rugi dihasilkan</span><strong className="money">{money(profitLoss.netProfitLoss)}</strong></div></CardContent>
      </Card>
    </div>
    <div className="grid gap-4 2xl:grid-cols-[.9fr_1.1fr]">
      <Card><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle>Status proyek</CardTitle><CardDescription className="mt-1">Ringkasan operasional</CardDescription></div><Link href="/entries" className="flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Input data<ArrowUpRight size={15} /></Link></CardHeader><CardContent className="space-y-5"><div><div className="mb-2 flex justify-between text-sm"><span>Selesai</span><strong>3 proyek</strong></div><div className="h-2 rounded-full bg-[var(--muted)]"><div className="h-2 w-[60%] rounded-full bg-[var(--primary)]" /></div></div><div><div className="mb-2 flex justify-between text-sm"><span>Sedang berjalan</span><strong>2 proyek</strong></div><div className="h-2 rounded-full bg-[var(--muted)]"><div className="h-2 w-[40%] rounded-full bg-[var(--muted-foreground)]" /></div></div><div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-xs text-[var(--muted-foreground)]">Progres pembayaran proyek yang belum selesai akan masuk di modul invoice dan piutang.</div></CardContent></Card>
      <Card className="overflow-hidden"><CardHeader className="flex-row items-start justify-between space-y-0"><div><CardTitle>Kontrak utama</CardTitle><CardDescription className="mt-1">Kontrak dengan nilai terbesar</CardDescription></div><Link href="/reports/profit-loss" className="flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Lihat semua<ArrowUpRight size={15} /></Link></CardHeader><CardContent className="p-0"><div className="divide-y divide-[var(--border)]">{contracts.map(([name, amount], index) => <div className="flex items-center gap-4 px-6 py-4" key={name}><div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--muted)] text-xs font-semibold text-[var(--muted-foreground)]">0{index + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{name}</div><div className="mt-1 text-xs text-[var(--muted-foreground)]">Proyek jasa</div></div><strong className="money text-sm">{amount}</strong></div>)}</div></CardContent></Card>
    </div>
  </div></AppShell>;
}
