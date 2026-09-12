"use client";

import { useState } from "react";
import { Check, Pencil, Search, Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/confirm-dialog";
import { upsertEntryAction, deleteEntryAction } from "@/app/(app)/entries/actions";

type Account = { id: string; code: string; name: string; statementType: "BALANCE_SHEET" | "PROFIT_LOSS"; amount: string };
type Period = { id: string; label: string; status: "OPEN" | "CLOSED" };
type ExistingEntry = { id: string; code: string; name: string; amount: string; description: string | null };

export function EntryForm({ accounts, periods, entries, isDemo }: { accounts: Account[]; periods: Period[]; entries: ExistingEntry[]; isDemo: boolean }) {
  const [selected, setSelected] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState(accounts[0]?.amount === "0" ? "" : accounts[0]?.amount ?? "");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const account = accounts.find((item) => item.id === selected);
  const openPeriod = periods.find((period) => period.status === "OPEN");

  function selectAccount(id: string) {
    const nextAccount = accounts.find((item) => item.id === id);
    const existing = entries.find((entry) => entry.code === nextAccount?.code);
    setSelected(id);
    setAmount(existing?.amount ?? (nextAccount?.amount === "0" ? "" : nextAccount?.amount ?? ""));
    setDescription(existing?.description ?? "");
    setEditingId(null);
    setSaved(false);
  }

  function editEntry(entry: ExistingEntry) {
    const nextAccount = accounts.find((item) => item.code === entry.code);
    if (!nextAccount) return;
    setSelected(nextAccount.id);
    setAmount(entry.amount);
    setDescription(entry.description ?? "");
    setEditingId(entry.id);
    setSaved(false);
  }

  function cancelEdit() {
    selectAccount(selected);
  }

  return <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]"><section className="panel p-6"><div className="mb-6 flex items-center justify-between"><h3 className="font-bold">Saldo periode</h3><span className="rounded-full bg-[#f0f0f0] px-3 py-1 text-xs font-bold text-[#2b2b2b]">{openPeriod ? "PERIODE TERBUKA" : "TIDAK ADA PERIODE TERBUKA"}</span></div><ConfirmForm action={isDemo ? undefined : upsertEntryAction} confirm={!isDemo} message="Saldo akun akan disimpan atau diperbarui pada periode terbuka." title={editingId ? "Simpan perubahan saldo?" : "Simpan saldo?"} onSubmit={isDemo ? (event) => { event.preventDefault(); setSaved(true); } : undefined}><input type="hidden" name="accountingPeriodId" value={openPeriod?.id ?? ""} /><label className="label">Bulan laporan<select name="accountingPeriodId" defaultValue={openPeriod?.id} disabled={!openPeriod || isDemo} aria-label="Pilih bulan laporan" className="mt-2 h-11 w-full rounded-md border border-[#dce2e7] bg-white px-3 text-sm outline-none focus:border-[#111111]">{periods.map((period) => <option key={period.id} value={period.id}>{period.label} · {period.status === "OPEN" ? "Terbuka" : "Tertutup"}</option>)}</select></label><label className="label mt-5 block">Kode akun<div className="relative mt-2"><Search size={16} className="absolute left-3 top-3 text-[#8a96a3]" /><select name="coaAccountId" value={selected} onChange={(event) => selectAccount(event.target.value)} aria-label="Pilih kode akun" className="h-11 w-full appearance-none rounded-md border border-[#dce2e7] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#111111]">{accounts.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></div></label>{account && <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-[#f7f9fb] p-4"><div><div className="label">Nama akun</div><div className="mt-1 text-sm font-semibold">{account.name}</div></div><div><div className="label">Masuk ke laporan</div><div className="mt-1 text-sm font-semibold">{account.statementType === "BALANCE_SHEET" ? "Neraca" : "Laba Rugi"}</div></div></div>}<label className="label mt-5 block">Saldo akhir (Rupiah)<input name="amount" aria-label="Saldo akhir dalam Rupiah" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" required className="money mt-2 h-12 w-full rounded-md border border-[#dce2e7] px-3 text-lg font-semibold outline-none focus:border-[#111111]" placeholder="Contoh: 50000000" /><span className="mt-2 block text-xs font-normal normal-case tracking-normal text-[#8a96a3]">Masukkan angka tanpa titik atau simbol Rupiah.</span></label><label className="label mt-5 block">Catatan <span className="font-normal normal-case tracking-normal">(opsional)</span><textarea name="description" aria-label="Catatan saldo" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-20 w-full rounded-md border border-[#dce2e7] p-3 text-sm outline-none focus:border-[#111111]" placeholder="Contoh: saldo dari rekening koran September" /></label><div className="mt-6 flex gap-2"><button type="submit" disabled={!openPeriod || !account} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#111111] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saved ? <><Check size={16} />Saldo tersimpan</> : editingId ? "Simpan perubahan" : "Simpan saldo"}</button>{editingId && <button type="button" onClick={cancelEdit} className="h-11 rounded-md border border-[#dce2e7] px-4 text-sm font-semibold text-[#52606d]">Batal</button>}</div>{saved && <p role="status" className="mt-2 text-center text-xs text-[#b66a1c]">Mode demo: data belum masuk database.</p>}</ConfirmForm></section><section className="panel overflow-hidden"><div className="border-b border-[#e5e9ed] p-6"><h3 className="font-bold">Saldo yang sudah diisi</h3><p className="mt-1 text-sm text-[#6b7785]">Saldo tersimpan pada periode terbuka.</p></div><div className="divide-y divide-[#eef1f3]">{entries.length ? entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 px-6 py-4"><div><div className="font-mono text-xs text-[#8a96a3]">{entry.code}</div><div className="mt-1 text-sm font-semibold">{entry.name}</div>{entry.description && <div className="mt-1 text-xs text-[#8a96a3]">{entry.description}</div>}</div><div className="flex items-center gap-3"><div className="money text-sm font-bold">Rp {Number(entry.amount).toLocaleString("id-ID")}</div>{!isDemo && <><button type="button" onClick={() => editEntry(entry)} title="Edit saldo" className="rounded-md p-1.5 text-[#2b2b2b] hover:bg-[#f0f0f0]"><Pencil size={15} /></button><ConfirmForm action={deleteEntryAction} message="Saldo akun akan dihapus dari periode ini." title="Hapus saldo?" confirmLabel="Hapus saldo" destructive><input type="hidden" name="id" value={entry.id} /><button type="submit" title="Hapus saldo" className="rounded-md p-1.5 text-[#b13f37] hover:bg-[#fff0ef]"><Trash2 size={15} /></button></ConfirmForm></>}</div></div>) : <div className="px-6 py-10 text-center text-sm text-[#8a96a3]">Belum ada saldo pada periode ini.</div>}</div></section></div>;
}
