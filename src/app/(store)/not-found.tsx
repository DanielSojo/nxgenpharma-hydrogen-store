import Link from 'next/link';
import { PackageSearch, Boxes, ArrowLeft } from 'lucide-react';

/**
 * 404 inside the store — rendered with the header, footer and drawers intact so
 * a mistyped product handle still leaves the buyer somewhere useful.
 */
export default function StoreNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border border-brand-line/70 bg-white p-10 text-center shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)] sm:p-14">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
          <PackageSearch size={30} />
        </span>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
          Error 404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-brand-navy">We couldn&apos;t find that page</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/70">
          The product or page you&apos;re looking for may have been renamed, discontinued, or moved.
          Browse the catalog to find what you need.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/collections/all"
            className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Boxes size={16} /> Browse catalog
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
