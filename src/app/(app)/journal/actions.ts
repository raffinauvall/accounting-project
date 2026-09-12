"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/services/auth.service";
import { clearJournalData, mapJournalTransaction } from "@/server/services/journal.service";

export async function mapJournalTransactionAction(formData: FormData) {
  const actor = await requireSession();
  if (actor.role === "VIEWER") throw new Error("Pengguna hanya dapat melihat jurnal");
  await mapJournalTransaction(String(formData.get("id") ?? ""), String(formData.get("inventoryItemId") ?? "") || null, String(formData.get("quantity") ?? "0"));
  revalidatePath("/journal");
  revalidatePath("/inventory");
}

export async function clearJournalDataAction() {
  const actor = await requireSession();
  if (actor.role !== "ADMIN") throw new Error("Hanya admin yang dapat menghapus seluruh jurnal");
  await clearJournalData();
  revalidatePath("/journal");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/profit-loss");
}
