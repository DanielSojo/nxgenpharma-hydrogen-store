import { SkeletonBlock } from '@/components/feedback/Skeletons';

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <SkeletonBlock className="mb-8 h-4 w-32" />
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="aspect-square w-full rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-9 w-3/4" />
          <SkeletonBlock className="h-24 w-full rounded-2xl" />
          <SkeletonBlock className="h-8 w-32" />
          <SkeletonBlock className="h-12 w-full rounded-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
        </div>
      </div>
      <span className="sr-only">Loading product…</span>
    </div>
  );
}
