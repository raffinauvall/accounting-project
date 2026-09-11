"use server";

import { revalidatePath } from "next/cache";
import { deleteEntry, upsertEntry } from "@/server/services/coa-entry.service";
import { getLocalAdminId } from "@/server/services/local-user.service";

export async function upsertEntryAction(formData: FormData) { await upsertEntry({ coaAccountId: String(formData.get("coaAccountId") ?? ""), accountingPeriodId: String(formData.get("accountingPeriodId") ?? ""), amount: String(formData.get("amount") ?? ""), description: String(formData.get("description") ?? "") }, await getLocalAdminId()); revalidatePath("/entries"); revalidatePath("/dashboard"); revalidatePath("/reports/balance-sheet"); revalidatePath("/reports/profit-loss"); }
export async function deleteEntryAction(formData: FormData) { await deleteEntry(String(formData.get("id") ?? "")); revalidatePath("/entries"); revalidatePath("/dashboard"); revalidatePath("/reports/balance-sheet"); revalidatePath("/reports/profit-loss"); }
