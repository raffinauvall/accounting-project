"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { endSession, startSession } from "@/server/services/auth.service";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) redirect("/login?error=Email%20atau%20password%20salah");
  await startSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
