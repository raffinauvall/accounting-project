"use server";

import { revalidatePath } from "next/cache";
import { createCoa, deleteCoa, deactivateCoa, updateCoa } from "@/server/services/coa.service";
import { getLocalAdminId } from "@/server/services/local-user.service";

const formInput = (formData: FormData) => { const accountType = String(formData.get("accountType") ?? "ASSET"); return { code: String(formData.get("code") ?? ""), name: String(formData.get("name") ?? ""), parentId: String(formData.get("parentId") ?? "") || null, accountType, statementType: accountType === "REVENUE" || accountType === "EXPENSE" ? "PROFIT_LOSS" : "BALANCE_SHEET", normalBalance: String(formData.get("normalBalance") ?? "DEBIT"), isPostingAccount: formData.get("isPostingAccount") === "on" }; };

export async function createCoaAction(formData: FormData) { await createCoa(formInput(formData), await getLocalAdminId()); revalidatePath("/coa"); }
export async function updateCoaAction(formData: FormData) { const id = String(formData.get("id") ?? ""); await updateCoa(id, formInput(formData), await getLocalAdminId()); revalidatePath("/coa"); }
export async function deactivateCoaAction(formData: FormData) { await deactivateCoa(String(formData.get("id") ?? ""), await getLocalAdminId()); revalidatePath("/coa"); }
export async function deleteCoaAction(formData: FormData) { await deleteCoa(String(formData.get("id") ?? ""), await getLocalAdminId()); revalidatePath("/coa"); }
