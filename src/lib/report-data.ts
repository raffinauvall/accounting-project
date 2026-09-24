import { Prisma } from "@prisma/client";
import { buildTree, calculateBalanceSheet, calculateProfitLoss, type ReportAccount } from "@/server/reports/calculations";
import { demoAccounts, demoPeriods } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { getFinancialReportAccounts, getFinancialReports } from "@/server/services/report.service";
import { requireConsolidatedAccess, requireOrganizationId } from "@/server/services/auth.service";

export type ReportPeriod = { id: string; month: number; year: number; label: string };

const emptyReports = () => ({
  balanceTree: [],
  balance: calculateBalanceSheet([]),
  profitLossTree: [],
  profitLoss: calculateProfitLoss([]),
  periodId: undefined,
  periods: [],
  periodLabel: "Belum ada periode",
  isDemo: false,
});

export function getDemoReports() {
  const balanceAccounts = demoAccounts.filter((account) => account.statementType === "BALANCE_SHEET");
  const profitLossAccounts = demoAccounts.filter((account) => account.statementType === "PROFIT_LOSS");
  return {
    balanceTree: buildTree(balanceAccounts),
    profitLossTree: buildTree(profitLossAccounts),
    balance: calculateBalanceSheet(balanceAccounts),
    profitLoss: calculateProfitLoss(profitLossAccounts),
  };
}

export async function getReports(selectedPeriodId?: string) {
  try {
    const organizationId = await requireOrganizationId();
    const periods = await prisma.accountingPeriod.findMany({ where: { organizationId }, orderBy: [{ year: "desc" }, { month: "desc" }] });
    const period = (selectedPeriodId ? periods.find((item) => item.id === selectedPeriodId) : undefined) ?? periods[0];
    if (!period) return emptyReports();
    const { balance, profitLoss } = await getFinancialReports(period);
    const reportPeriods = periods.map((item) => ({ id: item.id, month: item.month, year: item.year, label: `${new Date(item.year, item.month - 1, 1).toLocaleString("id-ID", { month: "long" })} ${item.year}` }));
    return { balanceTree: balance.tree, balance: balance.totals, profitLossTree: profitLoss.tree, profitLoss: profitLoss.totals, periodId: period.id, periods: reportPeriods, periodLabel: `${new Date(period.year, period.month - 1, 1).toLocaleString("id-ID", { month: "long" })} ${period.year}`, isDemo: false };
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("Report database unavailable, using demo data in development.", error);
    return { ...getDemoReports(), periodId: demoPeriods[1].id, periods: demoPeriods, periodLabel: "September 2026", isDemo: true };
  }
}

const reportLabel = (month: number, year: number) => new Date(year, month - 1, 1).toLocaleString("id-ID", { month: "long" }) + ` ${year}`;

export async function getConsolidatedReports(selectedPeriodId?: string) {
  const context = await requireConsolidatedAccess();
  const organizations = context.user.role === "SUPERADMIN" ? await prisma.organization.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } }) : context.organizations;
  const periods = await prisma.accountingPeriod.findMany({ where: { organizationId: { in: organizations.map((organization) => organization.id) } }, orderBy: [{ year: "desc" }, { month: "desc" }] });
  const periodKeys = [...new Set(periods.map((period) => `${period.year}-${String(period.month).padStart(2, "0")}`))];
  const periodKey = selectedPeriodId && periodKeys.includes(selectedPeriodId) ? selectedPeriodId : periodKeys[0];
  if (!periodKey) return { ...emptyReports(), periods: [], organizations, periodLabel: "Belum ada periode" };

  const [year, month] = periodKey.split("-").map(Number);
  const selectedPeriods = organizations.map((organization) => periods.find((period) => period.organizationId === organization.id && period.year === year && period.month === month)).filter((period): period is (typeof periods)[number] => Boolean(period));
  const reports = await Promise.all(selectedPeriods.map(async (period) => ({ period, accounts: await getFinancialReportAccounts(period) })));
  const combine = (statementType: ReportAccount["statementType"]) => {
    const combined = new Map<string, ReportAccount & { parentCode: string | null; total: Prisma.Decimal }>();
    for (const { accounts } of reports) {
      const rows = statementType === "BALANCE_SHEET" ? accounts.balanceAccounts : accounts.profitLossAccounts;
      const codeById = new Map(rows.map((account) => [account.id, account.code]));
      for (const account of rows) {
        const key = `${statementType}:${account.code}`;
        const current = combined.get(key);
        if (current) current.total = current.total.plus(account.amount);
        else combined.set(key, { ...account, id: key, parentCode: account.parentId ? codeById.get(account.parentId) ?? null : null, total: new Prisma.Decimal(account.amount) });
      }
    }
    return [...combined.values()].map(({ parentCode, total, ...account }) => ({ ...account, parentId: parentCode ? `${statementType}:${parentCode}` : null, amount: total.toFixed(2) }));
  };
  const balanceAccounts = combine("BALANCE_SHEET");
  const profitLossAccounts = combine("PROFIT_LOSS");
  return {
    balanceTree: buildTree(balanceAccounts),
    balance: calculateBalanceSheet(balanceAccounts),
    profitLossTree: buildTree(profitLossAccounts),
    profitLoss: calculateProfitLoss(profitLossAccounts),
    periodId: periodKey,
    periods: periodKeys.map((id) => { const [periodYear, periodMonth] = id.split("-").map(Number); return { id, month: periodMonth, year: periodYear, label: reportLabel(periodMonth, periodYear) }; }),
    periodLabel: reportLabel(month, year),
    organizations,
    isDemo: false,
  };
}
