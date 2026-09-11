import { AccountType, Prisma, StatementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { coaSchema } from "@/server/validators";
import { createAuditLog } from "@/server/services/audit-log.service";

const reportFor = (type: AccountType) => type === AccountType.REVENUE || type === AccountType.EXPENSE ? StatementType.PROFIT_LOSS : StatementType.BALANCE_SHEET;

export async function listCoa() { return prisma.coaAccount.findMany({ orderBy: { code: "asc" }, include: { children: true } }); }

export async function createCoa(raw: unknown, userId: string) {
  const input = coaSchema.parse(raw);
  if (input.statementType !== reportFor(input.accountType)) throw new Error("Tipe akun dan laporan tidak cocok");
  if (input.parentId) {
    const parent = await prisma.coaAccount.findUnique({ where: { id: input.parentId } });
    if (!parent || parent.statementType !== input.statementType || parent.accountType !== input.accountType) throw new Error("Parent COA tidak cocok");
    if (parent.isPostingAccount) throw new Error("Akun posting tidak boleh menjadi parent");
  }
  const account = await prisma.coaAccount.create({ data: { ...input, parentId: input.parentId ?? null } });
  await createAuditLog({ userId, action: "CREATE_COA", entity: "CoaAccount", entityId: account.id, metadata: input as unknown as Prisma.InputJsonValue });
  return account;
}

export async function updateCoa(id: string, raw: unknown, userId: string) {
  const input = coaSchema.parse(raw);
  if (input.statementType !== reportFor(input.accountType)) throw new Error("Tipe akun dan laporan tidak cocok");
  const current = await prisma.coaAccount.findUnique({ where: { id }, include: { _count: { select: { entries: true, children: true } } } });
  if (!current) throw new Error("Akun tidak ditemukan");
  if (current._count.entries > 0 && (input.accountType !== current.accountType || input.statementType !== current.statementType || input.normalBalance !== current.normalBalance || input.parentId !== current.parentId)) throw new Error("Mapping akun yang sudah dipakai tidak dapat diubah");
  if (input.parentId === id) throw new Error("Akun tidak dapat menjadi parent dirinya sendiri");
  const account = await prisma.coaAccount.update({ where: { id }, data: { ...input, parentId: input.parentId ?? null } });
  await createAuditLog({ userId, action: "UPDATE_COA", entity: "CoaAccount", entityId: id, metadata: input as unknown as Prisma.InputJsonValue });
  return account;
}

export async function deleteCoa(id: string, userId: string) {
  const current = await prisma.coaAccount.findUnique({ where: { id }, include: { _count: { select: { entries: true, children: true } } } });
  if (!current) throw new Error("Akun tidak ditemukan");
  if (current._count.entries > 0 || current._count.children > 0) throw new Error("Akun yang punya data tidak boleh dihapus; gunakan nonaktifkan");
  await prisma.coaAccount.delete({ where: { id } });
  await createAuditLog({ userId, action: "DELETE_COA", entity: "CoaAccount", entityId: id });
}

export async function deactivateCoa(id: string, userId: string) {
  const account = await prisma.coaAccount.update({ where: { id }, data: { isActive: false } });
  await createAuditLog({ userId, action: "DEACTIVATE_COA", entity: "CoaAccount", entityId: id });
  return account;
}
