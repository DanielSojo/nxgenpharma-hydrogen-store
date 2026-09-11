import { PageHeaderSkeleton, ListSkeleton } from '@/components/feedback/Skeletons';

/**
 * Default skeleton for store routes that don't ship a more specific one.
 * Keeps the header and footer on screen so navigation never blanks out.
 */
export default function StoreLoading() {
  return (
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeaderSkeleton />
      <ListSkeleton />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
