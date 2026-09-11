"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";

type ImportResult = { inserted: number; skipped: number; rows: number; unmappedRows: number; createdAccounts: number; createdPeriods: number };

export function JournalImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/journal/import", { method: "POST", body });
      const data = await response.json() as ImportResult & { message?: string };
      if (!response.ok) throw new Error(data.message || "Import jurnal gagal");
      setResult(data);
      setFile(null);
      event.currentTarget.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Import jurnal gagal");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="panel p-6"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#e5f3f1] text-[#08776e]"><FileSpreadsheet size={19} /></div><div><h3 className="font-bold">Import Excel Jurnal Umum</h3><p className="mt-1 text-sm text-[#6b7785]">Pilih file client dengan sheet <strong>JURNAL UMUM</strong>. Data akan masuk sebagai transaksi terpisah.</p><a href="/api/journal/template" download className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#138b82] hover:underline"><Download size={15} />Download template Excel</a></div></div><label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#b8c5cc] bg-[#fbfcfd] px-4 text-center hover:border-[#138b82] hover:bg-[#f4f7f8]"><UploadCloud size={22} className="text-[#138b82]" /><span className="mt-2 text-sm font-semibold">{file ? file.name : "Pilih file .xlsx"}</span><span className="mt-1 text-xs text-[#8a96a3]">Maksimal 20 MB</span><input type="file" accept=".xlsx" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label><button type="submit" disabled={!file || loading} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#138b82] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" />Memproses...</> : <><UploadCloud size={16} />Import jurnal</>}</button>{result && <div role="status" className="mt-4 flex gap-2 rounded-md bg-[#e5f3f1] p-3 text-sm text-[#08776e]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span>{result.inserted} transaksi berhasil diimport. {result.skipped ? `${result.skipped} transaksi dilewati karena sudah pernah diimport. ` : ""}{result.unmappedRows ? `${result.unmappedRows} baris tanpa Nomor Akun dilewati. ` : ""}{result.createdAccounts} COA dan {result.createdPeriods} periode dibuat otomatis.</span></div>}{error && <pre role="alert" className="mt-4 whitespace-pre-wrap rounded-md bg-[#fff0ef] p-3 text-sm text-[#b13f37]">{error}</pre>}</form>;
}
