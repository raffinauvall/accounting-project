"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/logo.jpg";
import { BarChart3, BookOpen, CalendarDays, FileBarChart2, FileSpreadsheet, LayoutDashboard, Package, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  ["Dasbor", "/dashboard", LayoutDashboard], ["Daftar Akun", "/coa", BookOpen], ["Input Saldo", "/entries", FileSpreadsheet],
  ["Jurnal Umum", "/journal", FileSpreadsheet],
  ["Persediaan", "/inventory", Package],
  ["Neraca", "/reports/balance-sheet", FileBarChart2], ["Laba Rugi", "/reports/profit-loss", BarChart3], ["Periode", "/periods", CalendarDays],
  ["Pengguna", "/users", Users], ["Riwayat Aktivitas", "/audit-logs", ShieldCheck],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:block"><div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-6"><div className="grid h-8 w-8 overflow-hidden rounded-md bg-[var(--primary)]"><Image src={logo} alt="Logo PT. APST" width={32} height={32} className="h-full w-full object-cover" /></div><div><div className="text-sm font-semibold tracking-tight">PT. APST</div><div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Ruang kerja keuangan</div></div></div><nav className="space-y-1 px-3 py-5">{navItems.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${pathname === href ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`}><Icon size={16} strokeWidth={1.8} />{label}</Link>)}</nav><div className="fixed bottom-5 px-6 text-xs text-[var(--muted-foreground)]">v0.1 · Mode lokal</div></aside>;
}
