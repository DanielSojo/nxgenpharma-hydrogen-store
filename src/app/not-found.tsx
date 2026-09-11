import Link from 'next/link';
import Image from 'next/image';
import { PackageSearch } from 'lucide-react';

/**
 * Root 404 for URLs that match no route at all (outside the store layout, so
 * it carries its own branding).
 */
export default function NotFound() {
  return (
    <div className="auth-aurora flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/75 p-12 text-center shadow-[0_30px_90px_-20px_rgba(23,50,82,0.35)] ring-1 ring-white/40 backdrop-blur-xl">
        <Image
          src="/nxgenpharma-logo.png"
          width={120}
          height={56}
          alt="NexGen Pharma"
          className="mx-auto mb-6 h-auto w-auto"
        />
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
          <PackageSearch size={26} />
        </span>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
          Error 404
        </p>
        <h1 className="mb-3 text-2xl font-bold text-brand-navy">Page not found</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/70">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="bg-brand-gradient-navy inline-block rounded-full px-8 py-3 text-[13px] font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
