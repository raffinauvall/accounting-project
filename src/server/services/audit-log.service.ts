import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function createAuditLog(data: { userId: string; action: AuditAction; entity: string; entityId: string; metadata?: Prisma.InputJsonValue }) {
  return prisma.auditLog.create({ data: { ...data, metadata: data.metadata } });
}
