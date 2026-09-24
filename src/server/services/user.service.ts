import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrganizationContext, requireOrganizationId, requireSuperadmin } from "@/server/services/auth.service";

const passwordHash = (password: string) => bcrypt.hash(password, 10);

export async function listUsers() {
  const context = await getOrganizationContext();
  return prisma.user.findMany({
    where: context.user.role === "SUPERADMIN" ? undefined : { organizationAccesses: { some: { organizationId: context.organization?.id } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, canViewConsolidated: true, organizationAccesses: { select: { organizationId: true, organization: { select: { id: true, name: true } } } } },
  });
}

export async function createUser(input: { name: string; email: string; password: string; role: string }) {
  const organizationId = await requireOrganizationId();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || name.length > 150) throw new Error("Nama user tidak valid");
  if (!email || !email.includes("@")) throw new Error("Email user tidak valid");
  if (input.password.length < 8) throw new Error("Password minimal 8 karakter");
  if (!Object.values(Role).includes(input.role as Role)) throw new Error("Role user tidak valid");
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new Error("Email sudah terdaftar");
  if (input.role === "SUPERADMIN") throw new Error("Superadmin hanya dapat dibuat melalui proses terkontrol");
  return prisma.user.create({ data: { organizationId, name, email, passwordHash: await passwordHash(input.password), role: input.role as Role, organizationAccesses: { create: { organizationId } } } });
}

export async function updateUserPassword(id: string, password: string) {
  const context = await getOrganizationContext();
  if (password.length < 8) throw new Error("Password minimal 8 karakter");
  const result = await prisma.user.updateMany({ where: { id, ...(context.user.role === "SUPERADMIN" ? {} : { organizationAccesses: { some: { organizationId: context.organization?.id } } }) }, data: { passwordHash: await passwordHash(password) } });
  if (result.count !== 1) throw new Error("Pengguna tidak ditemukan");
  return result;
}

export async function updateUserAccess(userId: string, organizationIds: string[], canViewConsolidated: boolean) {
  await requireSuperadmin();
  const ids = [...new Set(organizationIds.filter(Boolean))];
  if (!ids.length) throw new Error("Pilih minimal satu organisasi");
  const organizations = await prisma.organization.findMany({ where: { id: { in: ids }, isActive: true }, select: { id: true } });
  if (organizations.length !== ids.length) throw new Error("Organisasi akses tidak valid");
  await prisma.$transaction([
    prisma.userOrganization.deleteMany({ where: { userId } }),
    prisma.userOrganization.createMany({ data: ids.map((organizationId) => ({ userId, organizationId })), skipDuplicates: true }),
    prisma.user.update({ where: { id: userId }, data: { organizationId: ids[0], canViewConsolidated } }),
  ]);
}
