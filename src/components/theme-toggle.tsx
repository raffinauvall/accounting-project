"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button type="button" onClick={toggle} className="rounded-md p-2 text-[#6b7785] transition hover:bg-[#f4f7f8] hover:text-[#18222c]" aria-label={theme === "light" ? "Aktifkan dark mode" : "Aktifkan light mode"} title={theme === "light" ? "Dark mode" : "Light mode"}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>;
}
