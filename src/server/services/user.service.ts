import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireOrganizationId } from "@/server/services/auth.service";

const passwordHash = (password: string) => bcrypt.hash(password, 10);

export function listUsers() {
  return requireOrganizationId().then((organizationId) => prisma.user.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true } }));
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
  return prisma.user.create({ data: { organizationId, name, email, passwordHash: await passwordHash(input.password), role: input.role as Role } });
}

export async function updateUserPassword(id: string, password: string) {
  const organizationId = await requireOrganizationId();
  if (password.length < 8) throw new Error("Password minimal 8 karakter");
  const result = await prisma.user.updateMany({ where: { id, organizationId }, data: { passwordHash: await passwordHash(password) } });
  if (result.count !== 1) throw new Error("Pengguna tidak ditemukan");
  return result;
}
