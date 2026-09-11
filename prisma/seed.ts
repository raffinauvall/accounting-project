import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error("SEED_ADMIN_PASSWORD wajib diisi");

  await prisma.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com" },
    update: { name: "Administrator", passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN, isActive: true },
    create: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@example.com", name: "Administrator", passwordHash: await bcrypt.hash(password, 10), role: Role.ADMIN },
  });
}

main().finally(() => prisma.$disconnect());
