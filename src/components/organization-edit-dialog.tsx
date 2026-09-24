"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { updateOrganizationAction } from "@/app/(app)/organizations/actions";

export function OrganizationEditDialog({ id, name, slug }: { id: string; name: string; slug: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 text-xs font-bold text-white"><Pencil size={14} />Edit</button>
    {open && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby={`edit-organization-${id}`} className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><div className="label">Pengaturan organisasi</div><h2 id={`edit-organization-${id}`} className="mt-2 text-xl font-bold">Edit organisasi</h2></div><button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]" aria-label="Tutup modal"><X size={18} /></button></div><form action={updateOrganizationAction} onSubmit={() => setOpen(false)} className="mt-6 space-y-4"><input type="hidden" name="id" value={id} /><label className="label">Nama organisasi<input name="name" required maxLength={150} defaultValue={name} className="mt-2 h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm" /></label><label className="label">Slug<input name="slug" required maxLength={80} defaultValue={slug} className="mt-2 h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm" /></label><div className="flex justify-end gap-2 border-t border-[var(--border)] pt-5"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted-foreground)]">Batal</button><button className="h-10 rounded-md bg-[var(--primary)] px-4 text-sm font-bold text-white">Simpan perubahan</button></div></form></section></div>}
  </>;
}
