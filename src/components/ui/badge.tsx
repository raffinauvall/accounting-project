import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "secondary", ...props }: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }) {
  const variants = {
    default: "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
    secondary: "border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]",
    outline: "border-[var(--border)] text-[var(--foreground)]",
  };
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props} />;
}
