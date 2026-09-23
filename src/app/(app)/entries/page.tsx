import { AppShell } from "@/components/app-shell";
import { EntryForm } from "@/components/entry-form";
import { demoAccounts, demoPeriods } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export default async function EntriesPage() {
  const live = await prisma.accountingPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }).then(async (periods) => {
    const open = periods.find((period) => period.status === "OPEN");
    const accounts = await prisma.coaAccount.findMany({ where: { isActive: true, isPostingAccount: true }, orderBy: { code: "asc" }, include: { entries: { where: { accountingPeriodId: open?.id }, select: { amount: true } } } });
    const entries = open ? await prisma.coaEntry.findMany({ where: { accountingPeriodId: open.id }, orderBy: { updatedAt: "desc" }, include: { coaAccount: { select: { code: true, name: true } } } }) : [];
    return { periods, accounts, entries };
  }).catch(() => null);
  const periods = live?.periods.map((period) => ({ id: period.id, label: `${new Date(period.year, period.month - 1, 1).toLocaleString("id-ID", { month: "long" })} ${period.year}`, status: period.status })) ?? demoPeriods.map((period) => ({ id: period.id, label: period.label, status: period.status as "OPEN" | "CLOSED" }));
  const accounts = live?.accounts.map((account) => ({ id: account.id, code: account.code, name: account.name, statementType: account.statementType, amount: account.entries[0]?.amount.toString() ?? "0" })) ?? demoAccounts.filter((account) => account.code.split(".").length === 3);
  const entries = live?.entries.map((entry) => ({ id: entry.id, code: entry.coaAccount.code, name: entry.coaAccount.name, amount: entry.amount.toString(), description: entry.description })) ?? demoAccounts.filter((account) => account.amount !== "0").map((account) => ({ id: account.id, code: account.code, name: account.name, amount: account.amount, description: null }));
  return <AppShell title="Input saldo"><div className="space-y-7"><div><div className="label">Data keuangan</div><h2 className="mt-2 text-3xl font-bold tracking-tight">Input saldo akun</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Pilih periode dan akun, lalu masukkan saldo akhirnya.</p></div><EntryForm accounts={accounts} periods={periods} entries={entries} isDemo={!live} /></div></AppShell>;
}
