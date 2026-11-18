export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
