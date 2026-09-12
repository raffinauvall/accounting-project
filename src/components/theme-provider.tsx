"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const themeStorageKey = "ledgerly-theme-v2";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => undefined });
const getTheme = (): Theme => window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
const getServerTheme = (): Theme => "light";
const subscribe = (onChange: () => void) => { window.addEventListener("storage", onChange); window.addEventListener("ledgerly-theme-change", onChange); return () => { window.removeEventListener("storage", onChange); window.removeEventListener("ledgerly-theme-change", onChange); }; };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, getServerTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  const toggle = () => { const next = theme === "light" ? "dark" : "light"; window.localStorage.setItem(themeStorageKey, next); document.documentElement.dataset.theme = next; window.dispatchEvent(new Event("ledgerly-theme-change")); };
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
