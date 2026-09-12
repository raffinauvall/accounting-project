"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { endSession, startSession } from "@/server/services/auth.service";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  let user: { id: string; isActive: boolean; passwordHash: string } | null = null;
  let validPassword = false;
  try {
    user = await prisma.user.findUnique({ where: { email } });
    const passwordHash = user?.passwordHash ?? "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
    validPassword = await bcrypt.compare(password, passwordHash);
  } catch (error) {
    console.error("Login database error", error);
    redirect("/login?error=Layanan%20login%20belum%20siap%20di%20server");
  }
  if (!user || !user.isActive || !validPassword) redirect("/login?error=Email%20atau%20password%20salah");
  try {
    await startSession(user.id);
  } catch (error) {
    console.error("Login session error", error);
    redirect("/login?error=Konfigurasi%20session%20server%20belum%20siap");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
