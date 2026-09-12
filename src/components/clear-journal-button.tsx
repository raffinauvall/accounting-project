"use client";

import { Trash2 } from "lucide-react";
import { clearJournalDataAction } from "@/app/(app)/journal/actions";
import { ConfirmForm } from "@/components/confirm-dialog";

export function ClearJournalButton() {
  return <ConfirmForm action={clearJournalDataAction} message="Semua transaksi jurnal akan dihapus. Data ini tidak dapat dikembalikan." title="Bersihkan jurnal?" confirmLabel="Hapus semua" destructive><button type="submit" className="flex h-10 items-center justify-center gap-2 rounded-md border border-[#e5b6b2] px-4 text-sm font-bold text-[#b13f37] hover:bg-[#fff1f0]"><Trash2 size={16} />Bersihkan jurnal</button></ConfirmForm>;
}
