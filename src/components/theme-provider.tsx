"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => undefined });
const getTheme = (): Theme => window.localStorage.getItem("ledgerly-theme") === "dark" ? "dark" : "light";
const getServerTheme = (): Theme => "light";
const subscribe = (onChange: () => void) => { window.addEventListener("storage", onChange); window.addEventListener("ledgerly-theme-change", onChange); return () => { window.removeEventListener("storage", onChange); window.removeEventListener("ledgerly-theme-change", onChange); }; };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, getServerTheme);
  const toggle = () => { const next = theme === "light" ? "dark" : "light"; window.localStorage.setItem("ledgerly-theme", next); document.documentElement.dataset.theme = next; window.dispatchEvent(new Event("ledgerly-theme-change")); };
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
