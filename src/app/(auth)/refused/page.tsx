import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';

export default async function RefusedPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-14 text-center shadow-2xl">

        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-500" size={32} />
        </div>

        <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mx-auto mb-5">
          <path
            d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
            stroke="#1a1d6d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        <h1 className="mb-3 text-2xl font-bold text-brand-navy">Application Not Approved</h1>

        {session?.user && (
          <p className="mb-2 text-[15px] text-brand-ink/72">
            Hi {(session.user as any).firstName || session.user.name},
          </p>
        )}

        <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/72">
          Unfortunately your B2B account application for{' '}
          <span className="font-semibold text-brand-ink">{session?.user?.email}</span>{' '}
          was not approved at this time. If you believe this is a mistake or would like more information, please contact us.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/apply"
            className="w-full rounded-full border-2 border-brand-navy py-3.5 text-center text-[13px] font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            Submit a New Application
          </Link>

          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type="submit"
              className="w-full py-3 text-[13px] text-brand-ink/50 transition-colors hover:text-brand-navy"
            >
              Sign out
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
