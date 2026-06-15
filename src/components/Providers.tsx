'use client';

import { SessionProvider } from 'next-auth/react';
import AppLoader from '@/components/AppLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppLoader>{children}</AppLoader>
    </SessionProvider>
  );
}
