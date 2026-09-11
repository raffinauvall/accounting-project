import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/server/validators";
import { createAuditLog } from "@/server/services/audit-log.service";

export async function upsertEntry(raw: unknown, userId: string) {
  const input = entrySchema.parse(raw);
  const amount = new Prisma.Decimal(input.amount.replace(",", "."));
  const [account, period] = await prisma.$transaction([
    prisma.coaAccount.findUnique({ where: { id: input.coaAccountId } }),
    prisma.accountingPeriod.findUnique({ where: { id: input.accountingPeriodId } }),
  ]);
  if (!account || !account.isActive || !account.isPostingAccount) throw new Error("Akun tidak dapat menerima nominal");
  if (!period || period.status !== "OPEN") throw new Error("Periode sudah tertutup");
  const existing = await prisma.coaEntry.findUnique({ where: { coaAccountId_accountingPeriodId: { coaAccountId: input.coaAccountId, accountingPeriodId: input.accountingPeriodId } }, select: { id: true } });
  const entry = await prisma.coaEntry.upsert({ where: { coaAccountId_accountingPeriodId: { coaAccountId: input.coaAccountId, accountingPeriodId: input.accountingPeriodId } }, update: { amount, description: input.description }, create: { ...input, amount, description: input.description, createdById: userId } });
  await createAuditLog({ userId, action: existing ? "UPDATE_ENTRY" : "CREATE_ENTRY", entity: "CoaEntry", entityId: entry.id, metadata: { amount: amount.toString(), periodId: period.id } });
  return entry;
}

export async function deleteEntry(id: string) {
  const entry = await prisma.coaEntry.findUnique({ where: { id }, include: { accountingPeriod: true } });
  if (!entry) throw new Error("Saldo tidak ditemukan");
  if (entry.accountingPeriod.status !== "OPEN") throw new Error("Periode sudah tertutup");
  await prisma.coaEntry.delete({ where: { id } });
}
