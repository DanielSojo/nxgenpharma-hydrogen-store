import { PageHeaderSkeleton, CatalogSkeleton, SkeletonBlock } from '@/components/feedback/Skeletons';

/** Catalog skeleton: hero banner, the sticky filter bar, then product rows. */
export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeaderSkeleton />
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-brand-line/70 bg-white/80 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <SkeletonBlock className="h-11 w-44 rounded-full" />
          <SkeletonBlock className="h-11 w-32 rounded-full" />
          <SkeletonBlock className="h-11 w-40 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-20 rounded-full" />
          <SkeletonBlock className="h-11 w-48 rounded-full" />
        </div>
      </div>
      <CatalogSkeleton />
      <span className="sr-only">Loading catalog…</span>
    </div>
  );
}
