"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CalendarDays, FileBarChart2, FileSpreadsheet, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  ["Dashboard", "/dashboard", LayoutDashboard], ["Daftar Akun", "/coa", BookOpen], ["Input Saldo", "/entries", FileSpreadsheet],
  ["Jurnal Umum", "/journal", FileSpreadsheet],
  ["Neraca", "/reports/balance-sheet", FileBarChart2], ["Laba Rugi", "/reports/profit-loss", BarChart3], ["Periode", "/periods", CalendarDays],
  ["Pengguna", "/users", Users], ["Riwayat Aktivitas", "/audit-logs", ShieldCheck],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#e5e9ed] bg-white lg:block"><div className="flex h-20 items-center gap-3 border-b border-[#e5e9ed] px-7"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#138b82] text-lg font-bold text-white">L</div><div><div className="font-bold tracking-tight">Ledgerly</div><div className="text-[11px] text-[#6b7785]">FINANCE WORKSPACE</div></div></div><nav className="space-y-1 px-4 py-6">{navItems.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-[#e5f3f1] text-[#08776e]" : "text-[#687583] hover:bg-[#f4f7f8] hover:text-[#18222c]"}`}><Icon size={17} strokeWidth={1.8} />{label}</Link>)}</nav><div className="fixed bottom-5 px-7 text-xs text-[#a3adb7]">v0.1 · Mode lokal</div></aside>;
}
