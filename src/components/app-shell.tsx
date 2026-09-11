import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header title={title} /><main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main></div></div>;
}
