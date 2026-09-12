import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ label, value, note, icon: Icon, tone = "teal" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: "teal" | "blue" | "orange" | "slate" }) {
  const tones = { teal: "bg-[var(--muted)] text-[var(--foreground)]", blue: "bg-[var(--muted)] text-[var(--muted-foreground)]", orange: "bg-[var(--muted)] text-[var(--muted-foreground)]", slate: "bg-[var(--muted)] text-[var(--muted-foreground)]" };
  return <Card><CardHeader className="flex-row items-start justify-between space-y-0 pb-2"><CardTitle className="text-[var(--muted-foreground)]">{label}</CardTitle><div className={`grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon size={17} strokeWidth={1.8} /></div></CardHeader><CardContent><div className="money text-2xl font-bold tracking-tight">{value}</div><p className="mt-2 text-xs text-[var(--muted-foreground)]">{note}</p></CardContent></Card>;
}
