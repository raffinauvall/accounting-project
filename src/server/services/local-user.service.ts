import { prisma } from "@/lib/prisma";

export async function getLocalAdminId() {
  const user = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!user) throw new Error("User admin belum tersedia");
  return user.id;
}
