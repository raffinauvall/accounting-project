import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const cookieName = "pt-apst-session";
const organizationCookieName = "pt-apst-organization";
const sessionLifetime = 8 * 60 * 60;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (value) {
    if (process.env.NODE_ENV === "production" && value.length < 32) throw new Error("AUTH_SECRET minimal 32 karakter di production");
    return value;
  }
  if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) return process.env.DATABASE_URL;
  throw new Error("AUTH_SECRET belum dikonfigurasi");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function validSession(value: string | undefined) {
  if (!value) return null;
  const [userId, expiresAt, signature] = value.split(".");
  const payload = `${userId}.${expiresAt}`;
  if (!userId || !expiresAt || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return null;
  const expected = sign(payload);
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  return userId;
}

export async function startSession(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetime;
  (await cookies()).set(cookieName, `${userId}.${expiresAt}.${sign(`${userId}.${expiresAt}`)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: sessionLifetime, path: "/" });
}

export async function endSession() {
  (await cookies()).delete(cookieName);
}

export const getSessionUser = cache(async () => {
  const userId = validSession((await cookies()).get(cookieName)?.value);
  return userId ? prisma.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true, name: true, email: true, role: true, organizationId: true, canViewConsolidated: true, organizationAccesses: { where: { organization: { isActive: true } }, select: { organization: { select: { id: true, name: true, slug: true } } } } } }) : null;
});

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireWriteAccess() {
  const user = await requireSession();
  if (user.role === Role.VIEWER) throw new Error("Pengguna hanya dapat melihat data");
  return user;
}

export async function requireAdmin() {
  const user = await requireSession();
  if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) throw new Error("Hanya admin yang dapat melakukan tindakan ini");
  return user;
}

export const getOrganizationContext = cache(async () => {
  const user = await requireSession();
  const organizations = user.role === Role.SUPERADMIN
    ? await prisma.organization.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } })
    : user.organizationAccesses.map((access) => access.organization);
  const selectedId = (await cookies()).get(organizationCookieName)?.value;
  const organization = organizations.find((item) => item.id === selectedId) ?? organizations[0] ?? null;
  return { user, organization, organizations };
});

export async function requireOrganizationId() {
  const context = await getOrganizationContext();
  if (!context.organization) throw new Error("Belum ada organisasi aktif");
  return context.organization.id;
}

export async function requireSuperadmin() {
  const user = await requireSession();
  if (user.role !== Role.SUPERADMIN) throw new Error("Hanya superadmin yang dapat melakukan tindakan ini");
  return user;
}

export async function requireConsolidatedAccess() {
  const context = await getOrganizationContext();
  if (context.user.role !== Role.SUPERADMIN && !context.user.canViewConsolidated) throw new Error("Akses laporan konsolidasi belum diberikan");
  return context;
}

export async function setActiveOrganization(id: string) {
  const context = await getOrganizationContext();
  if (!context.organizations.some((organization) => organization.id === id)) throw new Error("Organisasi tidak ditemukan");
  (await cookies()).set(organizationCookieName, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: sessionLifetime, path: "/" });
}
