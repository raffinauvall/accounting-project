import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = { title: "Ledgerly | Laporan Keuangan", description: "Laporan keuangan berbasis COA" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
