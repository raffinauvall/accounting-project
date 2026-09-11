import type { ReportAccount } from "@/server/reports/calculations";

export const demoPeriods = [
  { id: "2026-08", month: 8, year: 2026, label: "Agustus 2026", status: "CLOSED" },
  { id: "2026-09", month: 9, year: 2026, label: "September 2026", status: "OPEN" },
];

export const demoAccounts: ReportAccount[] = [
  { id: "1", code: "1", name: "Aset", parentId: null, accountType: "ASSET", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "1.1", code: "1.1", name: "Aset Lancar", parentId: "1", accountType: "ASSET", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "1.1.1", code: "1.1.1", name: "Kas", parentId: "1.1", accountType: "ASSET", statementType: "BALANCE_SHEET", amount: "50000000" },
  { id: "1.1.2", code: "1.1.2", name: "Bank", parentId: "1.1", accountType: "ASSET", statementType: "BALANCE_SHEET", amount: "75000000" },
  { id: "1.1.3", code: "1.1.3", name: "Piutang", parentId: "1.1", accountType: "ASSET", statementType: "BALANCE_SHEET", amount: "25000000" },
  { id: "2", code: "2", name: "Liabilitas", parentId: null, accountType: "LIABILITY", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "2.1", code: "2.1", name: "Liabilitas Lancar", parentId: "2", accountType: "LIABILITY", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "2.1.1", code: "2.1.1", name: "Hutang Usaha", parentId: "2.1", accountType: "LIABILITY", statementType: "BALANCE_SHEET", amount: "50000000" },
  { id: "3", code: "3", name: "Ekuitas", parentId: null, accountType: "EQUITY", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "3.1", code: "3.1", name: "Modal", parentId: "3", accountType: "EQUITY", statementType: "BALANCE_SHEET", amount: "100000000" },
  { id: "3.2", code: "3.2", name: "Laba Ditahan", parentId: "3", accountType: "EQUITY", statementType: "BALANCE_SHEET", amount: "0" },
  { id: "4", code: "4", name: "Pendapatan", parentId: null, accountType: "REVENUE", statementType: "PROFIT_LOSS", amount: "0" },
  { id: "4.1", code: "4.1", name: "Pendapatan Usaha", parentId: "4", accountType: "REVENUE", statementType: "PROFIT_LOSS", amount: "0" },
  { id: "4.1.1", code: "4.1.1", name: "Pendapatan Penjualan", parentId: "4.1", accountType: "REVENUE", statementType: "PROFIT_LOSS", amount: "100000000" },
  { id: "5", code: "5", name: "Beban", parentId: null, accountType: "EXPENSE", statementType: "PROFIT_LOSS", amount: "0" },
  { id: "5.1", code: "5.1", name: "Beban Operasional", parentId: "5", accountType: "EXPENSE", statementType: "PROFIT_LOSS", amount: "0" },
  { id: "5.1.1", code: "5.1.1", name: "Beban Gaji", parentId: "5.1", accountType: "EXPENSE", statementType: "PROFIT_LOSS", amount: "40000000" },
  { id: "5.1.2", code: "5.1.2", name: "Beban Listrik", parentId: "5.1", accountType: "EXPENSE", statementType: "PROFIT_LOSS", amount: "20000000" },
];
