"use client";

import { useState } from "react";

export function DemoAction({ children, className }: { children: React.ReactNode; className: string }) {
  const [message, setMessage] = useState(false);
  return <div><button type="button" onClick={() => setMessage(true)} className={className}>{children}</button>{message && <p role="status" className="mt-2 text-xs text-[#b66a1c]">Mode demo: perubahan belum tersimpan ke database.</p>}</div>;
}
