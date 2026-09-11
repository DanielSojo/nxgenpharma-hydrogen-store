'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/lib/site-content';

/**
 * Store-wide error boundary. Without this a failed Shopify request rendered
 * Next's raw error screen — no header, no footer, no way back.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Store] Unhandled error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border border-brand-line/70 bg-white p-10 text-center shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)] sm:p-14">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle size={30} />
        </span>

        <h1 className="mb-3 text-2xl font-bold text-brand-navy">Something went wrong</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/70">
          We couldn&apos;t load this page. This is usually temporary — try again, and if it keeps
          happening our team can help at{' '}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-semibold text-brand-blue hover:text-brand-navy"
          >
            {siteConfig.supportEmail}
          </a>
          .
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <RefreshCw size={16} /> Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-[11px] text-brand-ink/70">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
