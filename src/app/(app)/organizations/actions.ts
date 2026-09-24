"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOrganization, deleteOrganization, updateOrganization } from "@/server/services/organization.service";
import { requireSession, requireSuperadmin, setActiveOrganization } from "@/server/services/auth.service";

export async function createOrganizationAction(formData: FormData) {
  await requireSuperadmin();
  await createOrganization({ name: String(formData.get("name") || ""), slug: String(formData.get("slug") || "") });
  revalidatePath("/organizations");
  revalidatePath("/dashboard");
}

export async function switchOrganizationAction(formData: FormData) {
  await requireSession();
  await setActiveOrganization(String(formData.get("organizationId") || ""));
  redirect("/dashboard");
}

export async function updateOrganizationAction(formData: FormData) {
  await requireSuperadmin();
  await updateOrganization(String(formData.get("id") || ""), { name: String(formData.get("name") || ""), slug: String(formData.get("slug") || "") });
  revalidatePath("/organizations");
  revalidatePath("/dashboard");
  revalidatePath("/reports/consolidated");
}

export async function deleteOrganizationAction(formData: FormData) {
  await requireSuperadmin();
  await deleteOrganization(String(formData.get("id") || ""));
  revalidatePath("/organizations");
  revalidatePath("/dashboard");
  revalidatePath("/reports/consolidated");
}
