"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireWriteAccess } from "@/server/services/auth.service";
import { clearJournalData, mapJournalTransaction } from "@/server/services/journal.service";

export async function mapJournalTransactionAction(formData: FormData) {
  await requireWriteAccess();
  await mapJournalTransaction(String(formData.get("id") ?? ""), String(formData.get("inventoryItemId") ?? "") || null, String(formData.get("quantity") ?? "0"));
  revalidatePath("/journal");
  revalidatePath("/inventory");
}

export async function clearJournalDataAction() {
  await requireAdmin();
  await clearJournalData();
  revalidatePath("/journal");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports/balance-sheet");
  revalidatePath("/reports/profit-loss");
}
