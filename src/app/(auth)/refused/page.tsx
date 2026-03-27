import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';

export default async function RefusedPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="bg-[#f0ece4] rounded-2xl p-14 max-w-lg w-full text-center shadow-2xl">

        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-500" size={32} />
        </div>

        <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mx-auto mb-5">
          <path
            d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
            stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        <h1 className="text-2xl font-bold text-[#111] mb-3">Application Not Approved</h1>

        {session?.user && (
          <p className="text-[15px] text-[#555] mb-2">
            Hi {(session.user as any).firstName || session.user.name},
          </p>
        )}

        <p className="text-[15px] text-[#555] leading-relaxed mb-8">
          Unfortunately your B2B account application for{' '}
          <span className="font-semibold text-[#333]">{session?.user?.email}</span>{' '}
          was not approved at this time. If you believe this is a mistake or would like more information, please contact us.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/apply"
            className="w-full py-3.5 border-2 border-[#111] text-[#111] hover:bg-[#111] hover:text-white rounded-full text-[13px] font-semibold text-center transition-colors"
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
              className="w-full py-3 text-[#999] hover:text-[#555] text-[13px] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}