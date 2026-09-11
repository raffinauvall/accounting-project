import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import logo from "@/logo.jpg";
import "./globals.css";

export const metadata: Metadata = { title: "PT. APST | Laporan Keuangan", description: "Laporan keuangan berbasis COA", icons: { icon: logo.src, apple: logo.src } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
