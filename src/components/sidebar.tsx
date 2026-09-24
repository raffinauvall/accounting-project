"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/logo.jpeg";
import { BarChart3, BookOpen, Building2, CalendarDays, FileBarChart2, FileSpreadsheet, Layers3, LayoutDashboard, Package, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  ["Dasbor", "/dashboard", LayoutDashboard], ["Daftar Akun", "/coa", BookOpen], ["Input Saldo", "/entries", FileSpreadsheet],
  ["Jurnal Umum", "/journal", FileSpreadsheet],
  ["Persediaan", "/inventory", Package],
  ["Neraca", "/reports/balance-sheet", FileBarChart2], ["Laba Rugi", "/reports/profit-loss", BarChart3], ["Periode", "/periods", CalendarDays],
  ["Pengguna", "/users", Users], ["Riwayat Aktivitas", "/audit-logs", ShieldCheck],
  ["Organisasi", "/organizations", Building2, "SUPERADMIN"], ["Konsolidasi", "/reports/consolidated", Layers3, "CONSOLIDATED"],
] as const;

export function visibleNavItems(role: string, canViewConsolidated = false) { return navItems.filter((item) => !item[3] || item[3] === role || (item[3] === "CONSOLIDATED" && (canViewConsolidated || role === "SUPERADMIN"))); }

export function Sidebar({ role, canViewConsolidated }: { role: string; canViewConsolidated: boolean }) {
  const pathname = usePathname();
  return <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:block"><div className="flex h-20 items-center gap-3 border-b border-[var(--border)] px-6"><div className="grid h-9 w-9 overflow-hidden rounded-lg bg-[var(--primary)]"><Image src={logo} alt="Logo ARVI CREATION" width={36} height={36} className="h-full w-full object-cover" /></div><div><div className="text-sm font-semibold tracking-tight">ARVI CREATION</div><div className="mt-0.5 text-[10px] uppercase tracking-[.14em] text-[var(--muted-foreground)]">Ruang kerja keuangan</div></div></div><nav className="space-y-1 px-3 py-6">{visibleNavItems(role, canViewConsolidated).map(([label, href, Icon]) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`}><Icon size={17} strokeWidth={1.8} />{label}</Link>; })}</nav><div className="absolute bottom-6 px-6 text-xs text-[var(--muted-foreground)]">v0.1 · Mode lokal</div></aside>;
}
