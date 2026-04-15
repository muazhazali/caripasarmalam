export default function Loading() {
  return (
    <div className="animate-pulse pb-16 md:pb-0">
      {/* Search/filter bar skeleton */}
      <div className="border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="h-10 bg-muted rounded-lg flex-1" />
          <div className="h-10 bg-muted rounded-lg w-full sm:w-40" />
          <div className="h-10 bg-muted rounded-lg w-full sm:w-40" />
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <div className="h-4 bg-muted rounded w-32" />
      </div>

      {/* Cards skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
