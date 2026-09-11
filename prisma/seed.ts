import { PrismaClient, AccountType, NormalBalance, Role, StatementType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const accounts = [
  ["1", "Aset", null, AccountType.ASSET, NormalBalance.DEBIT, false],
  ["1.1", "Aset Lancar", "1", AccountType.ASSET, NormalBalance.DEBIT, false],
  ["1.1.1", "Kas", "1.1", AccountType.ASSET, NormalBalance.DEBIT, true],
  ["1.1.2", "Bank", "1.1", AccountType.ASSET, NormalBalance.DEBIT, true],
  ["1.1.3", "Piutang", "1.1", AccountType.ASSET, NormalBalance.DEBIT, true],
  ["2", "Liabilitas", null, AccountType.LIABILITY, NormalBalance.CREDIT, false],
  ["2.1", "Liabilitas Lancar", "2", AccountType.LIABILITY, NormalBalance.CREDIT, false],
  ["2.1.1", "Hutang Usaha", "2.1", AccountType.LIABILITY, NormalBalance.CREDIT, true],
  ["3", "Ekuitas", null, AccountType.EQUITY, NormalBalance.CREDIT, false],
  ["3.1", "Modal", "3", AccountType.EQUITY, NormalBalance.CREDIT, true],
  ["3.2", "Laba Ditahan", "3", AccountType.EQUITY, NormalBalance.CREDIT, true],
  ["4", "Pendapatan", null, AccountType.REVENUE, NormalBalance.CREDIT, false],
  ["4.1", "Pendapatan Usaha", "4", AccountType.REVENUE, NormalBalance.CREDIT, false],
  ["4.1.1", "Pendapatan Penjualan", "4.1", AccountType.REVENUE, NormalBalance.CREDIT, true],
  ["5", "Beban", null, AccountType.EXPENSE, NormalBalance.DEBIT, false],
  ["5.1", "Beban Operasional", "5", AccountType.EXPENSE, NormalBalance.DEBIT, false],
  ["5.1.1", "Beban Gaji", "5.1", AccountType.EXPENSE, NormalBalance.DEBIT, true],
  ["5.1.2", "Beban Listrik", "5.1", AccountType.EXPENSE, NormalBalance.DEBIT, true],
] as const;

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("SEED_ADMIN_PASSWORD wajib diisi");

  const ids = new Map<string, string>();
  for (const [code, name, parentCode, accountType, normalBalance, isPostingAccount] of accounts) {
    const account = await prisma.coaAccount.upsert({
      where: { code },
      update: { name, accountType, statementType: accountType === AccountType.REVENUE || accountType === AccountType.EXPENSE ? StatementType.PROFIT_LOSS : StatementType.BALANCE_SHEET, normalBalance, isPostingAccount, isActive: true },
      create: { code, name, parentId: parentCode ? ids.get(parentCode) : null, accountType, statementType: accountType === AccountType.REVENUE || accountType === AccountType.EXPENSE ? StatementType.PROFIT_LOSS : StatementType.BALANCE_SHEET, normalBalance, isPostingAccount },
    });
    ids.set(code, account.id);
  }

  const admin = await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com" },
    update: { name: "Administrator", passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN, isActive: true },
    create: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com", name: "Administrator", passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN },
  });

  const now = new Date();
  const period = await prisma.accountingPeriod.upsert({
    where: { month_year: { month: now.getMonth() + 1, year: now.getFullYear() } },
    update: {},
    create: { month: now.getMonth() + 1, year: now.getFullYear(), startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
  });

  const sampleEntries = [["1.1.1", "50000000"], ["1.1.2", "75000000"], ["1.1.3", "25000000"], ["2.1.1", "50000000"], ["3.1", "100000000"], ["4.1.1", "100000000"], ["5.1.1", "40000000"], ["5.1.2", "20000000"]];
  if (await prisma.coaEntry.count() === 0) for (const [code, amount] of sampleEntries) {
    const accountId = ids.get(code);
    if (accountId) await prisma.coaEntry.create({ data: { coaAccountId: accountId, accountingPeriodId: period.id, amount, createdById: admin.id, description: "Saldo contoh demo" } });
  }
}

main().finally(() => prisma.$disconnect());
