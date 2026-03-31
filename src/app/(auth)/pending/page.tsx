import Link from 'next/link';
import { Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { signOut } from '@/lib/auth';

export default async function PendingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-14 text-center shadow-2xl">

        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-amber-600" size={32} />
        </div>

        <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mx-auto mb-5">
          <path
            d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
            stroke="#1a1d6d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        <h1 className="mb-3 text-2xl font-bold text-brand-navy">Application Under Review</h1>

        {session?.user && (
          <p className="mb-2 text-[15px] text-brand-ink/72">
            Hi {(session.user as any).firstName || session.user.name},
          </p>
        )}

        <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/72">
          Your B2B account application is currently being reviewed. We'll send you an email at{' '}
          <span className="font-semibold text-brand-ink">{session?.user?.email}</span> once
          your account has been approved, typically within 24 hours.
        </p>

        <div className="mb-8 rounded-xl bg-brand-mist p-5 text-left">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-brand-ink">What happens next?</h3>
          <ol className="flex flex-col gap-2.5">
            {[
              'Our team reviews your application',
              'You receive an approval email with account access',
              'Set your password and start ordering',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] text-brand-ink/72">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/contact"
            className="w-full rounded-full border-2 border-brand-navy py-3 text-[13px] font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            Questions? Contact Us
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
