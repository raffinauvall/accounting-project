import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, note, icon: Icon, tone = "teal" }: { label: string; value: string; note: string; icon: LucideIcon; tone?: "teal" | "blue" | "orange" | "slate" }) {
  const tones = { teal: "bg-[#f0f0f0] text-[#2b2b2b]", blue: "bg-[#e8eff8] text-[#3d6999]", orange: "bg-[#fff1df] text-[#b66a1c]", slate: "bg-[#edf0f2] text-[#5f6d7a]" };
  return <section className="panel p-5"><div className="flex items-start justify-between"><div><div className="label">{label}</div><div className="money mt-3 text-2xl font-bold tracking-tight">{value}</div></div><div className={`grid h-10 w-10 place-items-center rounded-lg ${tones[tone]}`}><Icon size={19} strokeWidth={1.8} /></div></div><div className="mt-3 text-xs text-[#8a96a3]">{note}</div></section>;
}
