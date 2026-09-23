import type { ReportNode } from "@/server/reports/calculations";
import { money } from "@/lib/money";

export function ReportTree({ nodes, depth = 0 }: { nodes: ReportNode[]; depth?: number }) {
  return <>{nodes.map((node) => <div key={node.id}><div className={`flex min-h-12 items-center justify-between border-b border-[var(--border)] py-3 ${depth === 0 ? "font-bold" : depth === 1 ? "font-semibold" : ""}`} style={{ paddingLeft: `${depth * 24}px` }}><div className="flex min-w-0 items-center gap-3"><span className="w-14 shrink-0 font-mono text-xs text-[var(--muted-foreground)]">{node.code}</span><span className="truncate">{node.name}</span>{!node.children.length && node.amount !== "0" && <span className="hidden rounded bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] sm:inline">Akun saldo</span>}</div><span className="money ml-4 shrink-0 text-sm">{money(node.total)}</span></div><ReportTree nodes={node.children} depth={depth + 1} /></div>)}</>;
}
