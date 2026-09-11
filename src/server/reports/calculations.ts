import { Prisma } from "@prisma/client";

export type ReportAccount = {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  accountType: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  statementType: "BALANCE_SHEET" | "PROFIT_LOSS";
  normalBalance?: "DEBIT" | "CREDIT";
  amount: string;
};

export type ReportNode = ReportAccount & { children: ReportNode[]; total: string };

const sum = (values: Prisma.Decimal[]) => values.reduce((total, value) => total.plus(value), new Prisma.Decimal(0));

function buildNode(account: ReportAccount, children: ReportNode[]): ReportNode {
  const total = new Prisma.Decimal(account.amount).plus(sum(children.map((child) => new Prisma.Decimal(child.total))));
  return { ...account, children, total: total.toFixed(2) };
}

export function buildTree(accounts: ReportAccount[]): ReportNode[] {
  const childrenByParent = new Map<string | null, ReportAccount[]>();
  for (const account of accounts) childrenByParent.set(account.parentId, [...(childrenByParent.get(account.parentId) ?? []), account]);

  const walk = (parentId: string | null): ReportNode[] =>
    (childrenByParent.get(parentId) ?? []).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map((account) => buildNode(account, walk(account.id)));

  return walk(null);
}

export function calculateBalanceSheet(accounts: ReportAccount[]) {
  const totals = (type: ReportAccount["accountType"]) => sum(accounts.filter((account) => account.accountType === type).map((account) => new Prisma.Decimal(account.amount)));
  const asset = totals("ASSET");
  const liability = totals("LIABILITY");
  const equity = totals("EQUITY");
  const liabilityAndEquity = liability.plus(equity);
  return { asset: asset.toFixed(2), liability: liability.toFixed(2), equity: equity.toFixed(2), liabilityAndEquity: liabilityAndEquity.toFixed(2), difference: asset.minus(liabilityAndEquity).toFixed(2), balanced: asset.eq(liabilityAndEquity) };
}

export function calculateProfitLoss(accounts: ReportAccount[]) {
  const revenue = sum(accounts.filter((account) => account.accountType === "REVENUE").map((account) => new Prisma.Decimal(account.amount)));
  const expense = sum(accounts.filter((account) => account.accountType === "EXPENSE").map((account) => new Prisma.Decimal(account.amount)));
  return { revenue: revenue.toFixed(2), expense: expense.toFixed(2), netProfitLoss: revenue.minus(expense).toFixed(2) };
}
