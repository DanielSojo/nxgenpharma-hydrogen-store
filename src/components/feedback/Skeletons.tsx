/**
 * Shared loading placeholders.
 *
 * These mirror the real layouts closely enough that the page doesn't jump when
 * the data lands — a generic centered spinner made every route feel like a
 * cold start.
 */

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-brand-line/45 ${className}`} />;
}

/** Stand-in for the navy PageHeader banner every page leads with. */
export function PageHeaderSkeleton() {
  return (
    <div className="bg-catalog-hero relative mb-8 overflow-hidden rounded-3xl p-8 ring-1 ring-brand-line sm:p-10">
      <div className="relative flex flex-col gap-6">
        <div className="h-7 w-40 animate-pulse rounded-full bg-white/15" />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/15" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-white/15" />
        </div>
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

/** Catalog rows — matches the default list view of QuickOrderCatalog. */
export function CatalogSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-brand-line/70 bg-white px-4 py-4 sm:px-5"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.35fr)_minmax(180px,0.85fr)_minmax(360px,1.35fr)] lg:items-center">
            <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-4">
              <SkeletonBlock className="h-14 w-14 rounded-lg" />
              <SkeletonBlock className="h-4 w-full max-w-[220px]" />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <SkeletonBlock className="h-12 rounded-full" />
              <SkeletonBlock className="h-12 rounded-full" />
              <SkeletonBlock className="h-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stacked cards — orders, quotes and any other list of link rows. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-2xl border border-brand-line/70 bg-white px-6 py-5"
        >
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-11 w-11" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-3 w-52" />
            </div>
          </div>
          <SkeletonBlock className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
