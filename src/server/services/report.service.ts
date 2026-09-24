import { Prisma, type AccountingPeriod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ReportAccount } from "@/server/reports/calculations";
import { buildTree, calculateBalanceSheet, calculateProfitLoss } from "@/server/reports/calculations";

type ReportPeriod = Pick<AccountingPeriod, "id" | "organizationId" | "year" | "endDate">;
type AccountRow = Prisma.CoaAccountGetPayload<{ select: { id: true; code: true; name: true; parentId: true; accountType: true; statementType: true; normalBalance: true } }>;
type EntryRow = Prisma.CoaEntryGetPayload<{ select: { coaAccountId: true; amount: true } }>;
type JournalRow = Prisma.JournalTransactionGetPayload<{ select: { coaAccountId: true; accountingPeriodId: true; transactionDate: true; debit: true; credit: true } }>;

async function loadReportData(period: ReportPeriod) {
  const yearStart = new Date(Date.UTC(period.year, 0, 1));
  return Promise.all([
    prisma.coaAccount.findMany({
      where: { organizationId: period.organizationId, isActive: true },
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, parentId: true, accountType: true, statementType: true, normalBalance: true },
    }),
    prisma.coaEntry.findMany({ where: { organizationId: period.organizationId, accountingPeriodId: period.id }, select: { coaAccountId: true, amount: true } }),
    prisma.journalTransaction.findMany({
      where: { organizationId: period.organizationId, OR: [{ transactionDate: { gte: yearStart, lte: period.endDate } }, { accountingPeriodId: period.id }] },
      select: { coaAccountId: true, accountingPeriodId: true, transactionDate: true, debit: true, credit: true },
    }),
  ]);
}

function accountsFor(period: ReportPeriod, statementType: ReportAccount["statementType"], accounts: AccountRow[], entries: EntryRow[], journalTransactions: JournalRow[]): ReportAccount[] {
  const statementAccounts = accounts.filter((account) => account.statementType === statementType);
  const accountById = new Map(statementAccounts.map((account) => [account.id, account]));
  const entryAmounts = new Map(entries.map((entry) => [entry.coaAccountId, entry.amount]));
  const journalAmounts = new Map<string, Prisma.Decimal>();
  const yearStart = new Date(Date.UTC(period.year, 0, 1));
  const relevantTransactions = statementType === "BALANCE_SHEET"
    ? journalTransactions.filter((transaction) => transaction.transactionDate >= yearStart && transaction.transactionDate <= period.endDate)
    : journalTransactions.filter((transaction) => transaction.accountingPeriodId === period.id);

  for (const transaction of relevantTransactions) {
    const account = accountById.get(transaction.coaAccountId);
    if (!account) continue;
    const amount = account.normalBalance === "DEBIT" ? transaction.debit.minus(transaction.credit) : transaction.credit.minus(transaction.debit);
    journalAmounts.set(account.id, (journalAmounts.get(account.id) ?? new Prisma.Decimal(0)).plus(amount));
  }

  const useJournal = relevantTransactions.length > 0;
  return statementAccounts.map((account) => ({
    id: account.id,
    code: account.code,
    name: account.name,
    parentId: account.parentId,
    accountType: account.accountType,
    statementType: account.statementType,
    normalBalance: account.normalBalance,
    amount: (useJournal ? journalAmounts.get(account.id) : entryAmounts.get(account.id))?.toString() ?? "0",
  }));
}

export async function getFinancialReportAccounts(period: ReportPeriod) {
  const [accounts, entries, journalTransactions] = await loadReportData(period);
  const balanceAccounts = accountsFor(period, "BALANCE_SHEET", accounts, entries, journalTransactions);
  const profitLossAccounts = accountsFor(period, "PROFIT_LOSS", accounts, entries, journalTransactions);
  return { balanceAccounts, profitLossAccounts };
}

export async function getFinancialReports(period: ReportPeriod) {
  const { balanceAccounts, profitLossAccounts } = await getFinancialReportAccounts(period);
  return {
    balance: { tree: buildTree(balanceAccounts), totals: calculateBalanceSheet(balanceAccounts) },
    profitLoss: { tree: buildTree(profitLossAccounts), totals: calculateProfitLoss(profitLossAccounts) },
  };
}
