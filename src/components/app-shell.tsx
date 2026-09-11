import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { requireSession } from "@/server/services/auth.service";

export async function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const user = await requireSession();
  return <div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header title={title} user={user} /><main className="mx-auto max-w-[1440px] p-5 sm:p-8">{children}</main></div></div>;
}
