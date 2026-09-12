"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/services/auth.service";
import { createInventoryItem, deleteInventoryItem, updateInventoryItem } from "@/server/services/inventory.service";

export async function createInventoryItemAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role === "VIEWER") throw new Error("Pengguna hanya dapat melihat persediaan");
  await createInventoryItem({ name: String(formData.get("name") ?? ""), unit: String(formData.get("unit") ?? ""), openingStock: String(formData.get("openingStock") ?? "0") });
  revalidatePath("/inventory");
}

export async function updateInventoryItemAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role === "VIEWER") throw new Error("Pengguna hanya dapat melihat persediaan");
  await updateInventoryItem(String(formData.get("id") ?? ""), { name: String(formData.get("name") ?? ""), unit: String(formData.get("unit") ?? ""), openingStock: String(formData.get("openingStock") ?? "0") });
  revalidatePath("/inventory");
}

export async function deleteInventoryItemAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role === "VIEWER") throw new Error("Pengguna hanya dapat melihat persediaan");
  await deleteInventoryItem(String(formData.get("id") ?? ""));
  revalidatePath("/inventory");
}
