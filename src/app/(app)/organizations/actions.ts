"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createOrganization } from "@/server/services/organization.service";
import { requireSuperadmin, setActiveOrganization } from "@/server/services/auth.service";

export async function createOrganizationAction(formData: FormData) {
  await requireSuperadmin();
  await createOrganization({ name: String(formData.get("name") || ""), slug: String(formData.get("slug") || "") });
  revalidatePath("/organizations");
  revalidatePath("/dashboard");
}

export async function switchOrganizationAction(formData: FormData) {
  await requireSuperadmin();
  await setActiveOrganization(String(formData.get("organizationId") || ""));
  redirect("/dashboard");
}
