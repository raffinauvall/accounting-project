"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { demoPeriods } from "@/lib/demo-data";
import type { ReportPeriod } from "@/lib/report-data";

export function PeriodFilter({ selected, periods = demoPeriods }: { selected?: string; periods?: ReportPeriod[] }) {
  const router = useRouter();
  const value = selected ?? periods[0]?.id ?? "";
  return <div className="flex flex-wrap items-center gap-2"><span className="label mr-1">Periode</span>{periods.length ? <div className="relative"><select value={value} onChange={(event) => router.push(`?period=${event.target.value}`)} className="h-11 appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 pl-3 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--border)]">{periods.map((period) => <option key={period.id} value={period.id}>{period.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-[var(--muted-foreground)]" size={15} /></div> : <span className="text-sm text-[var(--muted-foreground)]">Belum ada periode</span>}<Link href="/periods" className="min-h-11 inline-flex items-center text-sm font-semibold text-[var(--foreground)] hover:underline">Kelola periode</Link></div>;
}
