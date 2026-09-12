"use server";

import { revalidatePath } from "next/cache";
import { closePeriod, createPeriod, deletePeriod } from "@/server/services/accounting-period.service";
import { requireWriteAccess } from "@/server/services/auth.service";

export async function createPeriodAction(formData: FormData) { await requireWriteAccess(); await createPeriod({ month: Number(formData.get("month")), year: Number(formData.get("year")) }); revalidatePath("/periods"); }
export async function closePeriodAction(formData: FormData) { const actor = await requireWriteAccess(); await closePeriod(String(formData.get("id") ?? ""), actor.id); revalidatePath("/periods"); }
export async function deletePeriodAction(formData: FormData) { await requireWriteAccess(); await deletePeriod(String(formData.get("id") ?? "")); revalidatePath("/periods"); }
