"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { navItems } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

export function Header({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="relative z-50 flex h-20 items-center justify-between border-b border-[#e5e9ed] bg-white px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative z-10 grid min-h-11 min-w-11 place-items-center rounded-md text-[#6b7785] hover:bg-[#f4f7f8] touch-manipulation lg:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-0.5 text-xs text-[#8a96a3]">Ringkasan operasional keuangan</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <button type="button" className="relative rounded-md p-2 text-[#6b7785] hover:bg-[#f4f7f8]" aria-label="Notifikasi">
          <Bell size={18} />
        </button>
        <div className="hidden h-8 w-px bg-[#e5e9ed] sm:block" />
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            className="flex min-h-11 items-center gap-2 rounded-md px-1.5 text-left hover:bg-[#f4f7f8]"
            aria-label="Buka menu akun"
            aria-expanded={userOpen}
            aria-controls="user-menu"
          >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#dcefeb] text-xs font-bold text-[#08776e]">AD</div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold">Administrator</div>
            <div className="text-[11px] text-[#8a96a3]">Admin · Lokal</div>
          </div>
            <ChevronDown size={15} className={`text-[#8a96a3] transition-transform ${userOpen ? "rotate-180" : ""}`} />
          </button>
          {userOpen && (
            <div id="user-menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[#e5e9ed] bg-white p-2 shadow-lg">
              <div className="border-b border-[#e5e9ed] px-3 py-2">
                <div className="text-sm font-semibold">Administrator</div>
                <div className="mt-0.5 text-xs text-[#8a96a3]">admin@example.com</div>
              </div>
              <Link href="/users" onClick={() => setUserOpen(false)} className="mt-1 block rounded-md px-3 py-2 text-sm text-[#687583] hover:bg-[#f4f7f8]">Kelola pengguna</Link>
              <Link href="/login" onClick={() => setUserOpen(false)} className="block rounded-md px-3 py-2 text-sm text-[#687583] hover:bg-[#f4f7f8]">Ganti akun</Link>
            </div>
          )}
        </div>
      </div>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/20 lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <div id="mobile-navigation" className="absolute left-0 right-0 top-full z-50 border-b border-[#e5e9ed] bg-white p-3 shadow-lg lg:hidden">
            <nav className="space-y-1">
              {navItems.map(([label, href, Icon]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${pathname === href ? "bg-[#e5f3f1] text-[#08776e]" : "text-[#687583]"}`}>
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
