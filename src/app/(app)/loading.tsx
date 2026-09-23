const navigation = Array.from({ length: 10 });

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--border)] ${className}`} />;
}

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--background)]" aria-busy="true" aria-label="Memuat halaman">
      <aside className="hidden w-[248px] shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-[var(--border)] px-6">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-2 w-32" /></div>
        </div>
        <nav className="space-y-2 px-3 py-6" aria-hidden="true">
          {navigation.map((_, index) => <Skeleton key={index} className={`h-11 ${index === 0 ? "bg-[var(--muted)]" : "bg-transparent"}`} />)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 sm:px-8">
          <div className="space-y-2"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-5 w-36" /></div>
          <div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="hidden h-3 w-24 sm:block" /></div>
        </header>
        <main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10">
          <div className="space-y-7">
            <div className="flex items-end justify-between gap-4"><div className="space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-9 w-64" /><Skeleton className="h-4 w-96 max-w-[70vw]" /></div><Skeleton className="hidden h-11 w-40 md:block" /></div>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="panel h-32 p-5"><div className="flex h-full flex-col justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-7 w-32" /><Skeleton className="h-2.5 w-28" /></div></div>)}
            </div>
            <div className="grid gap-4 2xl:grid-cols-[1.45fr_.75fr]"><div className="panel h-80 p-6"><Skeleton className="h-4 w-40" /><Skeleton className="mt-3 h-3 w-64" /><div className="mt-10 space-y-7"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></div><div className="panel h-80 p-6"><Skeleton className="h-4 w-40" /><Skeleton className="mt-3 h-3 w-52" /><Skeleton className="mx-auto mt-10 h-36 w-36 rounded-full" /></div></div>
          </div>
        </main>
      </div>
    </div>
  );
}
