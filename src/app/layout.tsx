import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import logo from "@/logo.jpeg";
import "./globals.css";

export const metadata: Metadata = { title: "ARVI CREATION | Laporan Keuangan", description: "Laporan keuangan berbasis COA", icons: { icon: logo.src, apple: logo.src } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
