"use client";

import { useEffect, useRef, useState, type FormEvent, type FormHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, message, confirmLabel, destructive = false, onCancel, onConfirm }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onCancel]);

  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${destructive ? "bg-[var(--destructive-soft)] text-[var(--destructive)]" : "bg-[var(--muted)] text-[var(--foreground)]"}`}><AlertTriangle size={19} /></div><button type="button" onClick={onCancel} className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]" aria-label="Tutup konfirmasi"><X size={18} /></button></div><h2 id="confirm-dialog-title" className="mt-5 text-lg font-bold text-[var(--foreground)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{message}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} className="h-10 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted-foreground)]">Batal</button><button ref={confirmRef} type="button" onClick={onConfirm} className={`h-10 rounded-md px-4 text-sm font-bold text-white ${destructive ? "bg-[var(--destructive)] hover:bg-[var(--destructive)]" : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"}`}>{confirmLabel}</button></div></div></div>;
}

type ConfirmFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & {
  action?: FormHTMLAttributes<HTMLFormElement>["action"];
  children: ReactNode;
  message: string;
  title?: string;
  confirmLabel?: string;
  destructive?: boolean;
  confirm?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function ConfirmForm({ action, children, message, title = "Konfirmasi tindakan", confirmLabel = "Ya, lanjutkan", destructive = false, confirm = true, onSubmit, ...props }: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [open, setOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (!confirm || confirmed.current) {
      confirmed.current = false;
      onSubmit?.(event);
      return;
    }
    event.preventDefault();
    setOpen(true);
  }

  function click(event: MouseEvent<HTMLFormElement>) {
    if (!confirm || confirmed.current) return;
    const submitter = (event.target as HTMLElement).closest("button, input[type=submit]");
    if (!submitter || (submitter.tagName === "BUTTON" && submitter.getAttribute("type") === "button")) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  }

  function confirmSubmit() {
    setOpen(false);
    confirmed.current = true;
    formRef.current?.requestSubmit();
  }

  return <><form ref={formRef} action={action} onClickCapture={click} onSubmit={submit} {...props}>{children}</form><ConfirmDialog open={open} title={title} message={message} confirmLabel={confirmLabel} destructive={destructive} onCancel={() => setOpen(false)} onConfirm={confirmSubmit} /></>;
}
