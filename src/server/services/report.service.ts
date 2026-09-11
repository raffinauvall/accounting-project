import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ReportAccount } from "@/server/reports/calculations";
import { buildTree, calculateBalanceSheet, calculateProfitLoss } from "@/server/reports/calculations";

async function accountsFor(periodId: string, statementType: ReportAccount["statementType"]): Promise<ReportAccount[]> {
  const period = await prisma.accountingPeriod.findUniqueOrThrow({ where: { id: periodId } });
  const yearStart = new Date(Date.UTC(period.year, 0, 1));
  const journalWhere = statementType === "BALANCE_SHEET" ? { transactionDate: { gte: yearStart, lte: period.endDate } } : { accountingPeriodId: periodId };
  const [accounts, entries, journalTransactions] = await Promise.all([
    prisma.coaAccount.findMany({ where: { statementType, isActive: true }, orderBy: { code: "asc" } }),
    prisma.coaEntry.findMany({ where: { accountingPeriodId: periodId }, select: { coaAccountId: true, amount: true } }),
    prisma.journalTransaction.findMany({ where: journalWhere, select: { coaAccountId: true, debit: true, credit: true } }),
  ]);
  const entryAmounts = new Map(entries.map((entry) => [entry.coaAccountId, entry.amount]));
  const journalAmounts = new Map<string, Prisma.Decimal>();
  for (const transaction of journalTransactions) {
    const account = accounts.find((item) => item.id === transaction.coaAccountId);
    if (!account) continue;
    const amount = account.normalBalance === "DEBIT" ? transaction.debit.minus(transaction.credit) : transaction.credit.minus(transaction.debit);
    journalAmounts.set(account.id, (journalAmounts.get(account.id) ?? new Prisma.Decimal(0)).plus(amount));
  }
  const useJournal = journalTransactions.length > 0;
  return accounts.map((account) => ({ id: account.id, code: account.code, name: account.name, parentId: account.parentId, accountType: account.accountType, statementType: account.statementType, normalBalance: account.normalBalance, amount: (useJournal ? journalAmounts.get(account.id) : entryAmounts.get(account.id))?.toString() ?? "0" }));
}

export async function getBalanceSheet(periodId: string) { const accounts = await accountsFor(periodId, "BALANCE_SHEET"); return { tree: buildTree(accounts), totals: calculateBalanceSheet(accounts) }; }
export async function getProfitLoss(periodId: string) { const accounts = await accountsFor(periodId, "PROFIT_LOSS"); return { tree: buildTree(accounts), totals: calculateProfitLoss(accounts) }; }
