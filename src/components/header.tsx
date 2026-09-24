"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { visibleNavItems } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/login/actions";
import { ConfirmForm } from "@/components/confirm-dialog";
import { useEffect, useState } from "react";
import { switchOrganizationAction } from "@/app/(app)/organizations/actions";

const roleLabels: Record<string, string> = { ADMIN: "Admin", SUPERADMIN: "Superadmin", FINANCE: "Keuangan", VIEWER: "Penampil" };

type Organization = { id: string; name: string; slug: string };

export function Header({ title, user, organization, organizations }: { title: string; user: { name: string; email: string; role: string }; organization: Organization | null; organizations: Organization[] }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const initials = user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); setUserOpen(false); } }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, []);
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 sm:px-8">
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
          <p className="text-xs font-medium text-[var(--muted-foreground)]">Ruang kerja / {title}</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user.role === "SUPERADMIN" && organizations.length > 0 ? <form action={switchOrganizationAction} className="hidden md:block"><label htmlFor="active-organization" className="sr-only">Organisasi aktif</label><select id="active-organization" name="organizationId" defaultValue={organization?.id ?? ""} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-10 max-w-48 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium"><option value="" disabled>Organisasi</option>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></form> : organization ? <div className="hidden max-w-40 truncate rounded-md bg-[var(--muted)] px-3 py-2 text-xs font-semibold md:block" title={organization.name}>{organization.name}</div> : null}
        <ThemeToggle />
        <div className="hidden h-8 w-px bg-[var(--border)] sm:block" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-left hover:bg-[var(--muted)]"
            aria-label="Buka menu akun"
            aria-expanded={userOpen}
            aria-controls="user-menu"
          >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--muted)] text-xs font-bold text-[var(--foreground)]">{initials || "PT"}</div>
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
              {visibleNavItems(user.role).map(([label, href, Icon]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${pathname === href || pathname.startsWith(`${href}/`) ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
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
