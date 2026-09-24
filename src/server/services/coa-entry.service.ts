import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { entrySchema } from "@/server/validators";
import { createAuditLog } from "@/server/services/audit-log.service";
import { requireOrganizationId } from "@/server/services/auth.service";

export async function upsertEntry(raw: unknown, userId: string) {
  const organizationId = await requireOrganizationId();
  const input = entrySchema.parse(raw);
  const amount = new Prisma.Decimal(input.amount.replace(",", "."));
  const [account, period] = await prisma.$transaction([
    prisma.coaAccount.findFirst({ where: { id: input.coaAccountId, organizationId } }),
    prisma.accountingPeriod.findFirst({ where: { id: input.accountingPeriodId, organizationId } }),
  ]);
  if (!account || !account.isActive || !account.isPostingAccount) throw new Error("Akun tidak dapat menerima nominal");
  if (!period || period.status !== "OPEN") throw new Error("Periode sudah tertutup");
  const existing = await prisma.coaEntry.findFirst({ where: { organizationId, coaAccountId: input.coaAccountId, accountingPeriodId: input.accountingPeriodId }, select: { id: true } });
  const entry = existing
    ? await prisma.coaEntry.update({ where: { id: existing.id }, data: { amount, description: input.description } })
    : await prisma.coaEntry.create({ data: { ...input, organizationId, amount, description: input.description, createdById: userId } });
  await createAuditLog({ userId, action: existing ? "UPDATE_ENTRY" : "CREATE_ENTRY", entity: "CoaEntry", entityId: entry.id, metadata: { amount: amount.toString(), periodId: period.id } });
  return entry;
}

export async function deleteEntry(id: string) {
  const organizationId = await requireOrganizationId();
  const entry = await prisma.coaEntry.findFirst({ where: { id, organizationId }, include: { accountingPeriod: true } });
  if (!entry) throw new Error("Saldo tidak ditemukan");
  if (entry.accountingPeriod.status !== "OPEN") throw new Error("Periode sudah tertutup");
  await prisma.coaEntry.delete({ where: { id } });
}
