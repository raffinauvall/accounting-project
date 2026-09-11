import { PeriodStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { periodSchema } from "@/server/validators";
import { createAuditLog } from "@/server/services/audit-log.service";

export async function listPeriods() { return prisma.accountingPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }); }

export async function createPeriod(raw: unknown) {
  const { month, year } = periodSchema.parse(raw);
  return prisma.accountingPeriod.create({ data: { month, year, startDate: new Date(year, month - 1, 1), endDate: new Date(year, month, 0) } });
}

export async function closePeriod(id: string, userId: string) {
  const period = await prisma.accountingPeriod.updateMany({ where: { id, status: PeriodStatus.OPEN }, data: { status: PeriodStatus.CLOSED } });
  if (period.count !== 1) throw new Error("Periode tidak ditemukan atau sudah tertutup");
  await createAuditLog({ userId, action: "CLOSE_PERIOD", entity: "AccountingPeriod", entityId: id });
}

export async function deletePeriod(id: string) {
  const period = await prisma.accountingPeriod.findUnique({ where: { id }, include: { _count: { select: { entries: true } } } });
  if (!period) throw new Error("Periode tidak ditemukan");
  if (period._count.entries > 0 || period.status === PeriodStatus.CLOSED) throw new Error("Periode berisi data atau sudah tertutup");
  await prisma.accountingPeriod.delete({ where: { id } });
}
