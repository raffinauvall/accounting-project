"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/logo.jpg";
import { BarChart3, BookOpen, CalendarDays, FileBarChart2, FileSpreadsheet, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

export const navItems = [
  ["Dasbor", "/dashboard", LayoutDashboard], ["Daftar Akun", "/coa", BookOpen], ["Input Saldo", "/entries", FileSpreadsheet],
  ["Jurnal Umum", "/journal", FileSpreadsheet],
  ["Neraca", "/reports/balance-sheet", FileBarChart2], ["Laba Rugi", "/reports/profit-loss", BarChart3], ["Periode", "/periods", CalendarDays],
  ["Pengguna", "/users", Users], ["Riwayat Aktivitas", "/audit-logs", ShieldCheck],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#e5e9ed] bg-white lg:block"><div className="flex h-20 items-center gap-3 border-b border-[#e5e9ed] px-7"><div className="grid h-9 w-9 overflow-hidden rounded-lg bg-[#111111]"><Image src={logo} alt="Logo PT. APST" width={36} height={36} className="h-full w-full object-cover" /></div><div><div className="font-bold tracking-tight">PT. APST</div><div className="text-[11px] text-[#6b7785]">RUANG KERJA KEUANGAN</div></div></div><nav className="space-y-1 px-4 py-6">{navItems.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-[#f0f0f0] text-[#2b2b2b]" : "text-[#687583] hover:bg-[#f4f7f8] hover:text-[#18222c]"}`}><Icon size={17} strokeWidth={1.8} />{label}</Link>)}</nav><div className="fixed bottom-5 px-7 text-xs text-[#a3adb7]">v0.1 · Mode lokal</div></aside>;
}
