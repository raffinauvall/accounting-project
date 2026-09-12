"use server";

import { revalidatePath } from "next/cache";
import { createCoa, deleteCoa, deactivateCoa, updateCoa } from "@/server/services/coa.service";
import { requireWriteAccess } from "@/server/services/auth.service";

const formInput = (formData: FormData) => { const accountType = String(formData.get("accountType") ?? "ASSET"); return { code: String(formData.get("code") ?? ""), name: String(formData.get("name") ?? ""), parentId: String(formData.get("parentId") ?? "") || null, accountType, statementType: accountType === "REVENUE" || accountType === "EXPENSE" ? "PROFIT_LOSS" : "BALANCE_SHEET", normalBalance: String(formData.get("normalBalance") ?? "DEBIT"), isPostingAccount: formData.get("isPostingAccount") === "on" }; };

export async function createCoaAction(formData: FormData) { const actor = await requireWriteAccess(); await createCoa(formInput(formData), actor.id); revalidatePath("/coa"); }
export async function updateCoaAction(formData: FormData) { const actor = await requireWriteAccess(); const id = String(formData.get("id") ?? ""); await updateCoa(id, formInput(formData), actor.id); revalidatePath("/coa"); }
export async function deactivateCoaAction(formData: FormData) { const actor = await requireWriteAccess(); await deactivateCoa(String(formData.get("id") ?? ""), actor.id); revalidatePath("/coa"); }
export async function deleteCoaAction(formData: FormData) { const actor = await requireWriteAccess(); await deleteCoa(String(formData.get("id") ?? ""), actor.id); revalidatePath("/coa"); }
