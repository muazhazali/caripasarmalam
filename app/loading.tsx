export default function Loading() {
  return (
    <div className="animate-pulse pb-16 md:pb-0">
      {/* Hero skeleton */}
      <div className="bg-orange-50 dark:bg-orange-950/20 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="h-8 bg-orange-200 dark:bg-orange-900/40 rounded-md w-2/3" />
          <div className="h-4 bg-orange-200 dark:bg-orange-900/40 rounded w-1/2" />
          <div className="h-10 bg-orange-200 dark:bg-orange-900/40 rounded-lg w-full max-w-md mt-4" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
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
