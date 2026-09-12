"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button type="button" onClick={toggle} className="rounded-md bg-transparent p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]" aria-label={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"} title={theme === "light" ? "Mode gelap" : "Mode terang"}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>;
}
