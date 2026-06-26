'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TrendingUp } from 'lucide-react';
import { SellerDashboard } from '../profile/SellerDashboard';
import PageHeader from '@/components/layout/PageHeader';

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
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        eyebrow="Seller"
        title="Seller Dashboard"
        icon={TrendingUp}
        description="Track your associated clinics, their orders, and your profit in one place."
      />

      <SellerDashboard alwaysShow />
    </div>
  );
}
