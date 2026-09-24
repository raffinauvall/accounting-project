import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function createAuditLog(data: { userId: string; action: AuditAction; entity: string; entityId: string; metadata?: Prisma.InputJsonValue }) {
  return prisma.user.findUnique({ where: { id: data.userId }, select: { organizationId: true } }).then((user) => prisma.auditLog.create({ data: { ...data, organizationId: user?.organizationId ?? null, metadata: data.metadata } }));
}
