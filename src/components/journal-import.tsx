"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type ImportResult = { inserted: number; skipped: number; rows: number; createdAccounts: number; createdPeriods: number };

export function JournalImport() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    setFile(nextFile);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file) setConfirmOpen(true);
  }

  async function importFile() {
    if (!file) return;
    setConfirmOpen(false);
    setLoading(true);
    setError("");
    setResult(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/journal/import", { method: "POST", body });
      const data = await response.json() as ImportResult & { message?: string };
      if (!response.ok) throw new Error(data.message || "Impor jurnal gagal");
      setResult(data);
      setFile(null);
      formRef.current?.reset();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Impor jurnal gagal");
    } finally {
      setLoading(false);
    }
  }

  return <><form ref={formRef} onSubmit={submit} className="panel p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--muted)] text-[var(--foreground)]"><FileSpreadsheet size={19} /></div><div><h3 className="font-bold">Impor Excel Jurnal Umum</h3><p className="mt-1 text-sm text-[var(--muted-foreground)]">Pilih file klien dengan sheet <strong>JURNAL UMUM</strong>. Data akan masuk sebagai transaksi terpisah.</p><a href="/api/journal/template" download className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] hover:underline"><Download size={15} />Unduh templat Excel</a></div></div><label onDragEnter={() => setDragging(true)} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); }} className={dragging ? "mt-5 flex min-h-32 scale-[1.01] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[var(--primary)] bg-[var(--muted)] px-4 text-center shadow-[0_0_0_4px_rgba(17,17,17,0.08)] transition-all duration-200" : "mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--card)] px-4 text-center transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--muted)]"}><UploadCloud size={22} className={dragging ? "animate-bounce text-[var(--foreground)]" : "text-[var(--foreground)]"} /><span className="mt-2 text-sm font-semibold">{dragging ? "Lepaskan file di sini" : file ? file.name : "Pilih atau seret file .xlsx"}</span><span className="mt-1 text-xs text-[var(--muted-foreground)]">Maksimal 20 MB</span><input type="file" accept=".xlsx" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} /></label><button type="submit" disabled={!file || loading} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" />Memproses...</> : <><UploadCloud size={16} />Impor jurnal</>}</button>{result && <div role="status" className="mt-4 flex gap-2 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--foreground)]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span>{result.inserted} transaksi berhasil diimpor. {result.skipped ? result.skipped + " transaksi dilewati karena sudah pernah diimpor. " : ""}{result.createdAccounts} COA dan {result.createdPeriods} periode dibuat otomatis.</span></div>}{error && <pre role="alert" className="mt-4 whitespace-pre-wrap rounded-md bg-[var(--destructive-soft)] p-3 text-sm text-[var(--destructive)]">{error}</pre>}</form><ConfirmDialog open={confirmOpen} title="Impor jurnal?" message={`File ${file?.name ?? "ini"} akan diproses dan menambah transaksi ke database.`} confirmLabel="Impor sekarang" onCancel={() => setConfirmOpen(false)} onConfirm={importFile} /></>;
}
