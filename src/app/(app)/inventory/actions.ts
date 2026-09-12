"use server";

import { revalidatePath } from "next/cache";
import { requireWriteAccess } from "@/server/services/auth.service";
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/server/services/inventory.service";

export async function createInventoryItemAction(formData: FormData) {
  await requireWriteAccess();
  await createInventoryItem({ name: String(formData.get("name") ?? ""), unit: String(formData.get("unit") ?? ""), openingStock: String(formData.get("openingStock") ?? "0") });
  revalidatePath("/inventory");
}

export async function updateInventoryItemAction(formData: FormData) {
  await requireWriteAccess();
  await updateInventoryItem(String(formData.get("id") ?? ""), { name: String(formData.get("name") ?? ""), unit: String(formData.get("unit") ?? ""), openingStock: String(formData.get("openingStock") ?? "0") });
  revalidatePath("/inventory");
}

export async function deleteInventoryItemAction(formData: FormData) {
  await requireWriteAccess();
  await deleteInventoryItem(String(formData.get("id") ?? ""));
  revalidatePath("/inventory");
}
