import Link from 'next/link';
import { Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { signOut } from '@/lib/auth';

export default async function PendingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="bg-[#f0ece4] rounded-2xl p-14 max-w-lg w-full text-center shadow-2xl">

        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-amber-600" size={32} />
        </div>

        <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mx-auto mb-5">
          <path
            d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
            stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        <h1 className="text-2xl font-bold text-[#111] mb-3">Application Under Review</h1>

        {session?.user && (
          <p className="text-[15px] text-[#555] mb-2">
            Hi {(session.user as any).firstName || session.user.name},
          </p>
        )}

        <p className="text-[15px] text-[#555] leading-relaxed mb-8">
          Your B2B account application is currently being reviewed. We'll send you an email at{' '}
          <span className="font-semibold text-[#333]">{session?.user?.email}</span> once
          your account has been approved, typically within 24 hours.
        </p>

        <div className="bg-white rounded-xl p-5 mb-8 text-left">
          <h3 className="text-[13px] font-bold text-[#333] mb-3 uppercase tracking-wider">What happens next?</h3>
          <ol className="flex flex-col gap-2.5">
            {[
              'Our team reviews your application',
              'You receive an approval email with account access',
              'Set your password and start ordering',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] text-[#555]">
                <span className="flex-shrink-0 w-5 h-5 bg-[#2b7fff] text-white rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5">
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
            className="w-full py-3 border-2 border-[#111] text-[#111] rounded-full text-[13px] font-semibold hover:bg-[#111] hover:text-white transition-colors"
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
