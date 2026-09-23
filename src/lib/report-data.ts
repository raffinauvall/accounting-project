import { buildTree, calculateBalanceSheet, calculateProfitLoss } from "@/server/reports/calculations";
import { demoAccounts, demoPeriods } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { getFinancialReports } from "@/server/services/report.service";

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
    const periods = await prisma.accountingPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });
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
