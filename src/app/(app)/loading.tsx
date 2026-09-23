export default function Loading() {
  return (
    <div className="space-y-7" aria-busy="true" aria-label="Memuat halaman">
      <div className="space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-9 w-64 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[var(--muted)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="panel h-32 animate-pulse bg-[var(--muted)]" />)}
      </div>
      <div className="panel h-80 animate-pulse bg-[var(--muted)]" />
    </div>
  );
}
