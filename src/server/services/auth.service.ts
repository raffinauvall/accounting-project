import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const cookieName = "pt-apst-session";
const sessionLifetime = 8 * 60 * 60;

function secret() {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET belum dikonfigurasi");
  return process.env.AUTH_SECRET;
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

export async function getSessionUser() {
  const userId = validSession((await cookies()).get(cookieName)?.value);
  return userId ? prisma.user.findFirst({ where: { id: userId, isActive: true }, select: { id: true, name: true, email: true, role: true } }) : null;
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
