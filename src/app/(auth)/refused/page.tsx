import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';
import Image from 'next/image';

export default async function RefusedPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-14 text-center shadow-2xl">

        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-500" size={32} />
        </div>

        <Image
          src="/nxgenpharma-logo.png"
          width={150}
          height={64}
          alt="NxGen Pharma Logo"
          className="mx-auto mb-5 h-auto w-auto"
        />

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
