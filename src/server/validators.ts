import { z } from "zod";

export const coaSchema = z.object({
  code: z.string().trim().min(1, "Kode COA wajib diisi").max(50),
  name: z.string().trim().min(1, "Nama akun wajib diisi").max(150),
  parentId: z.string().nullable().optional(),
  accountType: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  statementType: z.enum(["BALANCE_SHEET", "PROFIT_LOSS"]),
  normalBalance: z.enum(["DEBIT", "CREDIT"]),
  isPostingAccount: z.boolean().default(true),
});

export const entrySchema = z.object({
  coaAccountId: z.string().min(1),
  accountingPeriodId: z.string().min(1),
  amount: z.string().trim().regex(/^-?\d+(?:[.,]\d{1,2})?$/, "Nominal tidak valid"),
  description: z.string().trim().max(500).optional(),
});

export const periodSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(9999),
});
