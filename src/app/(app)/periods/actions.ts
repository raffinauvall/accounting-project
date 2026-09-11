"use server";

import { revalidatePath } from "next/cache";
import { closePeriod, createPeriod, deletePeriod } from "@/server/services/accounting-period.service";
import { getLocalAdminId } from "@/server/services/local-user.service";

export async function createPeriodAction(formData: FormData) { await createPeriod({ month: Number(formData.get("month")), year: Number(formData.get("year")) }); revalidatePath("/periods"); }
export async function closePeriodAction(formData: FormData) { await closePeriod(String(formData.get("id") ?? ""), await getLocalAdminId()); revalidatePath("/periods"); }
export async function deletePeriodAction(formData: FormData) { await deletePeriod(String(formData.get("id") ?? "")); revalidatePath("/periods"); }
