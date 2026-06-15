'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

/**
 * Full-screen branded loading overlay shown until the session resolves.
 *
 * Customer pricing markup lives on `session.user.markup`, which is only
 * available once `useSession()` finishes loading. Rendering prices before
 * then causes a base-price → marked-up-price flicker, so we mask the app
 * with a branded loader until pricing data is ready.
 */
export default function AppLoader({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const ready = status !== 'loading';
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!ready) return;
    // Keep the overlay mounted through the fade-out, then unmount it.
    const timeout = setTimeout(() => setRemoved(true), 350);
    return () => clearTimeout(timeout);
  }, [ready]);

  return (
    <>
      {children}

      {!removed && (
        <div
          aria-hidden={ready}
          role="status"
          className={`auth-aurora fixed inset-0 z-[100] flex flex-col items-center justify-center gap-7 transition-opacity duration-300 ${
            ready ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 scale-150 animate-ping rounded-full bg-brand-blue/10 blur-2xl" />
            <Image
              src="/nxgenpharma-logo.png"
              width={240}
              height={88}
              alt="NexGen Pharma"
              priority
              className="animate-logo-breathe drop-shadow-[0_12px_30px_rgba(23,50,82,0.18)]"
            />
          </div>

          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-brand-line/50">
            <div className="bg-brand-gradient animate-load-bar h-full w-1/3 rounded-full" />
          </div>

          <span className="sr-only">Loading…</span>
        </div>
      )}
    </>
  );
}
