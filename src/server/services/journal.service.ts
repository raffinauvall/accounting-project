import crypto from "node:crypto";
import ExcelJS from "exceljs";
import { AccountType, NormalBalance, Prisma, StatementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/server/services/audit-log.service";
import { requireOrganizationId } from "@/server/services/auth.service";

type SetupAccount = { name: string; category: string };
type ParsedJournal = {
  row: number;
  date: Date;
  code: string;
  name: string;
  offerNumber: string | null;
  invoiceNumber: string | null;
  description: string | null;
  credit: Prisma.Decimal;
  debit: Prisma.Decimal;
};

const valueResult = (value: unknown): unknown => {
  if (typeof value === "object" && value !== null && "result" in value) return (value as { result?: unknown }).result;
  return value;
};

const cellText = (cell: ExcelJS.Cell): string => {
  const value = valueResult(cell.value);
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  return "";
};

function parseDate(value: unknown): Date | null {
  const resolved = valueResult(value);
  if (resolved instanceof Date && !Number.isNaN(resolved.getTime())) return new Date(Date.UTC(resolved.getFullYear(), resolved.getMonth(), resolved.getDate()));
  if (typeof resolved === "number") return new Date(Date.UTC(1899, 11, 30 + Math.floor(resolved)));
  if (typeof resolved !== "string" || !resolved.trim()) return null;
  const text = resolved.trim();
  const local = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (local) return new Date(Date.UTC(Number(local[3]), Number(local[2]) - 1, Number(local[1])));
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function parseAmount(value: unknown): Prisma.Decimal {
  const resolved = valueResult(value);
  if (resolved === null || resolved === undefined || resolved === "") return new Prisma.Decimal(0);
  if (typeof resolved === "number") return new Prisma.Decimal(String(resolved));
  const raw = String(resolved).trim().replace(/[^\d,.-]/g, "");
  if (!raw || raw === "-" || raw === "." || raw === ",") return new Prisma.Decimal(0);
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  let normalized = raw;
  if (lastComma >= 0 && lastDot >= 0) normalized = lastComma > lastDot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  else if (lastComma >= 0) normalized = raw.split(",")[1]?.length === 1 || raw.split(",")[1]?.length === 2 ? raw.replace(",", ".") : raw.replace(/,/g, "");
  else if ((raw.match(/\./g) ?? []).length > 1) normalized = raw.replace(/\./g, "");
  return new Prisma.Decimal(normalized);
}

function accountPrefix(code: string) {
  return code.trim().match(/^\d+/)?.[0] ?? "";
}

function typeFromCategory(category: string, code = ""): { accountType: AccountType; normalBalance: NormalBalance } {
  const value = category.toLowerCase();
  if (value.includes("pendapatan")) return { accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT };
  if (value.includes("ekuitas")) return { accountType: AccountType.EQUITY, normalBalance: NormalBalance.CREDIT };
  if (value.includes("hutang") || value.includes("kewajiban")) return { accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT };
  if (value.includes("beban") || value.includes("harga_pokok")) return { accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT };
  if (value.includes("depresiasi") || value.includes("amortisasi")) return { accountType: AccountType.ASSET, normalBalance: NormalBalance.CREDIT };
  if (accountPrefix(code) === "2") return { accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT };
  if (accountPrefix(code) === "3") return { accountType: AccountType.EQUITY, normalBalance: NormalBalance.CREDIT };
  if (accountPrefix(code) === "4") return { accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT };
  if (accountPrefix(code) === "5" || accountPrefix(code) === "6") return { accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT };
  return { accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT };
}

function readSetup(sheet: ExcelJS.Worksheet): Map<string, SetupAccount> {
  const accounts = new Map<string, SetupAccount>();
  for (let row = 6; row <= sheet.rowCount; row += 1) {
    const code = cellText(sheet.getCell(row, 5));
    if (code) accounts.set(code, { name: cellText(sheet.getCell(row, 4)), category: cellText(sheet.getCell(row, 6)) });
  }
  return accounts;
}

export async function importJournalWorkbook(buffer: Buffer, userId: string, fileName: string) {
  const organizationId = await requireOrganizationId();
  if (buffer.length > 20 * 1024 * 1024) throw new Error("Ukuran file maksimal 20 MB");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = workbook.getWorksheet("JURNAL UMUM");
  if (!sheet) throw new Error("Sheet JURNAL UMUM tidak ditemukan");
  const setup = workbook.getWorksheet("SETUP");
  const setupAccounts = setup ? readSetup(setup) : new Map<string, SetupAccount>();
  const rows: ParsedJournal[] = [];
  const errors: string[] = [];

  for (let row = 6; row <= sheet.rowCount; row += 1) {
    const date = parseDate(sheet.getCell(row, 4).value);
    const code = cellText(sheet.getCell(row, 12));
    let credit = parseAmount(sheet.getCell(row, 15).value);
    let debit = parseAmount(sheet.getCell(row, 16).value);
    if (!date && !code && credit.isZero() && debit.isZero()) continue;
    if (!date) errors.push(`Baris ${row}: tanggal tidak valid`);
    if (!code && (date || !credit.isZero() || !debit.isZero())) {
      errors.push(`Baris ${row}: Nomor Akun wajib diisi`);
    }
    if (credit.isZero() && debit.isZero()) errors.push(`Baris ${row}: nominal kredit/debet kosong`);
    if (!date || !code || (credit.isZero() && debit.isZero())) continue;
    if (credit.isNegative()) { debit = debit.plus(credit.abs()); credit = new Prisma.Decimal(0); }
    if (debit.isNegative()) { credit = credit.plus(debit.abs()); debit = new Prisma.Decimal(0); }
    if (credit.gt(0) && debit.gt(0)) errors.push(`Baris ${row}: isi kredit atau debet, jangan keduanya`);
    if (credit.gt(0) && debit.gt(0)) continue;
    const setupAccount = setupAccounts.get(code);
    rows.push({ row, date, code, name: cellText(sheet.getCell(row, 13)) || setupAccount?.name || code, offerNumber: cellText(sheet.getCell(row, 7)) || null, invoiceNumber: cellText(sheet.getCell(row, 8)) || null, description: cellText(sheet.getCell(row, 14)) || null, credit, debit });
  }
  if (errors.length) throw new Error(errors.slice(0, 20).join("\n"));
  if (!rows.length) throw new Error("Tidak ada transaksi valid pada sheet JURNAL UMUM");

  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
  const codes = [...new Set(rows.map((row) => row.code))];
  const existingAccounts = await prisma.coaAccount.findMany({ where: { organizationId, code: { in: codes } } });
  type ImportAccount = { id: string; code: string; isActive: boolean; isPostingAccount: boolean };
  const accountsByCode = new Map<string, ImportAccount>(existingAccounts.map((account) => [account.code, account]));
  const invalidAccounts = existingAccounts.filter((account) => !account.isActive || !account.isPostingAccount);
  if (invalidAccounts.length) throw new Error(`Akun tidak dapat menerima jurnal: ${invalidAccounts.map((account) => account.code).join(", ")}`);

  const result = await prisma.$transaction(async (tx) => {
    const periodsByKey = new Map<string, { id: string; status: "OPEN" | "CLOSED" }>();
    let createdAccounts = 0;
    let createdPeriods = 0;
    for (const row of rows) {
      const key = `${row.date.getUTCFullYear()}-${row.date.getUTCMonth() + 1}`;
      let period = periodsByKey.get(key);
      if (!period) {
        const [year, month] = key.split("-").map(Number);
        const existing = await tx.accountingPeriod.findUnique({ where: { organizationId_month_year: { organizationId, month, year } }, select: { id: true, status: true } });
        period = existing ?? await tx.accountingPeriod.create({ data: { organizationId, month, year, startDate: new Date(Date.UTC(year, month - 1, 1)), endDate: new Date(Date.UTC(year, month, 0)) }, select: { id: true, status: true } });
        if (!existing) createdPeriods += 1;
        periodsByKey.set(key, period);
      }
      if (period.status !== "OPEN") throw new Error(`Periode ${key} sudah tertutup`);
      if (!accountsByCode.has(row.code)) {
        const setupAccount = setupAccounts.get(row.code);
        const classification = typeFromCategory(setupAccount?.category ?? "", row.code);
        const account = await tx.coaAccount.create({ data: { organizationId, code: row.code, name: setupAccount?.name || row.name, accountType: classification.accountType, statementType: classification.accountType === AccountType.REVENUE || classification.accountType === AccountType.EXPENSE ? StatementType.PROFIT_LOSS : StatementType.BALANCE_SHEET, normalBalance: classification.normalBalance, isPostingAccount: true }, select: { id: true, code: true, isActive: true, isPostingAccount: true } });
        accountsByCode.set(row.code, account);
        createdAccounts += 1;
      }
    }
    const data = rows.map((row) => {
      const period = periodsByKey.get(`${row.date.getUTCFullYear()}-${row.date.getUTCMonth() + 1}`);
      const account = accountsByCode.get(row.code);
      if (!period || !account) throw new Error(`Mapping transaksi baris ${row.row} gagal`);
      return { organizationId, transactionDate: row.date, accountingPeriodId: period.id, coaAccountId: account.id, offerNumber: row.offerNumber, invoiceNumber: row.invoiceNumber, description: row.description, credit: row.credit, debit: row.debit, importKey: `${fileHash}-${row.row}`, sourceRow: row.row, createdById: userId };
    });
    const inserted = await tx.journalTransaction.createMany({ data, skipDuplicates: true });
    return { inserted: inserted.count, skipped: data.length - inserted.count, rows: data.length, createdAccounts, createdPeriods };
  });

  await createAuditLog({ userId, action: "IMPORT_JOURNAL", entity: "JournalTransaction", entityId: fileHash, metadata: { fileName, ...result } });
  return result;
}

export async function clearJournalData() {
  const organizationId = await requireOrganizationId();
  return prisma.journalTransaction.deleteMany({ where: { organizationId } });
}

export async function listJournalTransactions() {
  const organizationId = await requireOrganizationId();
  return prisma.journalTransaction.findMany({ where: { organizationId }, orderBy: [{ transactionDate: "desc" }, { sourceRow: "desc" }], take: 100, include: { coaAccount: { select: { code: true, name: true } }, accountingPeriod: { select: { month: true, year: true } }, inventoryItem: { select: { id: true, name: true, unit: true } } } });
}

export async function mapJournalTransaction(id: string, inventoryItemId: string | null, quantity: string) {
  const organizationId = await requireOrganizationId();
  if (!id) throw new Error("Transaksi jurnal tidak valid");
  if (inventoryItemId) {
    const item = await prisma.inventoryItem.findFirst({ where: { id: inventoryItemId, organizationId, isActive: true }, select: { id: true } });
    if (!item) throw new Error("Barang tidak ditemukan");
    const amount = new Prisma.Decimal(quantity.trim().replace(",", ".") || "0");
    if (amount.isNegative() || amount.isZero()) throw new Error("Kuantitas harus lebih besar dari nol");
    const result = await prisma.journalTransaction.updateMany({ where: { id, organizationId }, data: { inventoryItemId: item.id, inventoryQuantity: amount } });
    if (result.count !== 1) throw new Error("Transaksi jurnal tidak ditemukan");
    return result;
  }
  const result = await prisma.journalTransaction.updateMany({ where: { id, organizationId }, data: { inventoryItemId: null, inventoryQuantity: 0 } });
  if (result.count !== 1) throw new Error("Transaksi jurnal tidak ditemukan");
  return result;
}
