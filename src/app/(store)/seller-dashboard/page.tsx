'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TrendingUp } from 'lucide-react';
import { SellerDashboard } from '../profile/SellerDashboard';

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.role as string | null | undefined;
  const isSeller = role?.toLowerCase() === 'seller';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    // Only sellers can see this page — clinics (and everyone else) go to profile.
    if (status === 'authenticated' && !isSeller) {
      router.replace('/profile');
    }
  }, [status, isSeller, router]);

  if (status === 'loading' || (status === 'authenticated' && !isSeller)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (!isSeller) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-mist via-white to-brand-surface p-8 ring-1 ring-brand-line">
        <div className="flex items-center gap-3">
          <TrendingUp size={24} className="text-brand-blue" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">Seller</p>
            <h1 className="mt-2 text-2xl font-bold text-brand-navy">Seller Dashboard</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-ink/72">
          Track your associated clinics, their orders, and your profit in one place.
        </p>
      </div>

      <SellerDashboard alwaysShow />
    </div>
  );
}
