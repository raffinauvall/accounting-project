import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { getOrganizationContext } from "@/server/services/auth.service";

export async function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, organization, organizations } = await getOrganizationContext();
  return <div className="flex min-h-screen"><Sidebar role={user.role} canViewConsolidated={user.canViewConsolidated} /><div className="min-w-0 flex-1"><Header title={title} user={user} organization={organization} organizations={organizations} /><main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10"><div className="app-content">{children}</div></main></div></div>;
}
