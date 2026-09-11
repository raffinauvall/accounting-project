import { describe, expect, it } from "vitest";
import { calculateBalanceSheet, calculateProfitLoss, type ReportAccount } from "@/server/reports/calculations";

const account = (accountType: ReportAccount["accountType"], amount: string): ReportAccount => ({ id: amount + accountType, code: "x", name: "x", parentId: null, accountType, statementType: accountType === "REVENUE" || accountType === "EXPENSE" ? "PROFIT_LOSS" : "BALANCE_SHEET", amount });

describe("report calculations", () => {
  it("returns zero totals for empty data", () => { expect(calculateBalanceSheet([])).toMatchObject({ asset: "0.00", liability: "0.00", equity: "0.00", balanced: true }); expect(calculateProfitLoss([])).toEqual({ revenue: "0.00", expense: "0.00", netProfitLoss: "0.00" }); });
  it("calculates balance sheet totals and status", () => { const result = calculateBalanceSheet([account("ASSET", "150000000"), account("LIABILITY", "50000000"), account("EQUITY", "100000000")]); expect(result.asset).toBe("150000000.00"); expect(result.liability).toBe("50000000.00"); expect(result.equity).toBe("100000000.00"); expect(result.balanced).toBe(true); });
  it("calculates revenue, expense, and net profit", () => { const result = calculateProfitLoss([account("REVENUE", "100000000"), account("EXPENSE", "60000000")]); expect(result.revenue).toBe("100000000.00"); expect(result.expense).toBe("60000000.00"); expect(result.netProfitLoss).toBe("40000000.00"); });
});
