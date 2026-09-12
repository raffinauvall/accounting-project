"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { navItems } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/login/actions";
import { ConfirmForm } from "@/components/confirm-dialog";
import { useState } from "react";

const roleLabels: Record<string, string> = { ADMIN: "Admin", FINANCE: "Keuangan", VIEWER: "Penampil" };

export function Header({ title, user }: { title: string; user: { name: string; email: string; role: string } }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative z-10 grid min-h-10 min-w-10 place-items-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] touch-manipulation lg:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Ringkasan operasional keuangan</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <button type="button" className="relative rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]" aria-label="Notifikasi">
          <Bell size={18} />
        </button>
        <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            className="flex min-h-10 items-center gap-2 rounded-md px-1.5 text-left hover:bg-[var(--muted)]"
            aria-label="Buka menu akun"
            aria-expanded={userOpen}
            aria-controls="user-menu"
          >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">AD</div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold">{user.name}</div>
            <div className="text-[11px] text-[var(--muted-foreground)]">{roleLabels[user.role] ?? user.role} · Lokal</div>
          </div>
            <ChevronDown size={15} className={`text-[var(--muted-foreground)] transition-transform ${userOpen ? "rotate-180" : ""}`} />
          </button>
          {userOpen && (
            <div id="user-menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg">
              <div className="border-b border-[var(--border)] px-3 py-2">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{user.email}</div>
              </div>
              <Link href="/users" onClick={() => setUserOpen(false)} className="mt-1 block rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">Kelola pengguna</Link>
              <ConfirmForm action={logoutAction} message="Anda akan keluar dari ruang kerja keuangan." title="Konfirmasi keluar" confirmLabel="Keluar" className="mt-1"><button className="block w-full rounded-md px-3 py-2 text-left text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">Keluar</button></ConfirmForm>
            </div>
          )}
        </div>
      </div>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/20 lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <div id="mobile-navigation" className="absolute left-0 right-0 top-full z-50 border-b border-[var(--border)] bg-[var(--card)] p-3 shadow-lg lg:hidden">
            <nav className="space-y-1">
              {navItems.map(([label, href, Icon]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${pathname === href ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
