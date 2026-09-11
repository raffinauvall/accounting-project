"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUserPassword } from "@/server/services/user.service";
import { requireSession } from "@/server/services/auth.service";

export async function createUserAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role !== "ADMIN") throw new Error("Hanya admin yang dapat mengelola user");
  await createUser({ name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? ""), role: String(formData.get("role") ?? "VIEWER") });
  revalidatePath("/users");
}

export async function updateUserPasswordAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role !== "ADMIN") throw new Error("Hanya admin yang dapat mengelola user");
  await updateUserPassword(String(formData.get("id") ?? ""), String(formData.get("password") ?? ""));
  revalidatePath("/users");
}
