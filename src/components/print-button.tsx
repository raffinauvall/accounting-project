"use client";

import { Printer } from "lucide-react";

export function PrintButton() { return <button type="button" onClick={() => window.print()} className="no-print flex h-10 items-center gap-2 rounded-md border border-[#dce2e7] bg-white px-3 text-sm font-semibold text-[#52606d]"><Printer size={15} />Cetak</button>; }
