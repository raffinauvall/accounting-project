import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const passwordHash = (password: string) => bcrypt.hash(password, 10);

export function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true } });
}

export async function createUser(input: { name: string; email: string; password: string; role: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name || name.length > 150) throw new Error("Nama user tidak valid");
  if (!email || !email.includes("@")) throw new Error("Email user tidak valid");
  if (input.password.length < 8) throw new Error("Password minimal 8 karakter");
  if (!Object.values(Role).includes(input.role as Role)) throw new Error("Role user tidak valid");
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new Error("Email sudah terdaftar");
  return prisma.user.create({ data: { name, email, passwordHash: await passwordHash(input.password), role: input.role as Role } });
}

export async function updateUserPassword(id: string, password: string) {
  if (password.length < 8) throw new Error("Password minimal 8 karakter");
  return prisma.user.update({ where: { id }, data: { passwordHash: await passwordHash(password) } });
}
