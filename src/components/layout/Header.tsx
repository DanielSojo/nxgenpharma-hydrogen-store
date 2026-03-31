'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ClipboardList, User, LogOut, Menu, X } from 'lucide-react';
import { useQuoteStore } from '@/store/quote';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();
  const { openQuote, totalItems } = useQuoteStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = totalItems();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-line/80 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/nxgenpharma-logo.png" width={70} height={40} alt="NxGen Pharma Logo" />
          <span className="hidden text-lg font-bold text-brand-navy sm:block">NxGen Pharma</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Home</Link>
          <Link href="/collections/all" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Catalog</Link>
          <Link href="/about" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">About</Link>
          <Link href="/faqs" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">FAQs</Link>
          <Link href="/quotes" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Quotes</Link>
          <Link href="/orders" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Orders</Link>
          <Link href="/contact" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Contact</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Quote button */}
          <button
            onClick={openQuote}
            className="relative rounded-full p-2 text-brand-ink/70 transition-colors hover:bg-brand-mist hover:text-brand-navy"
            aria-label="Open quote"
          >
            <ClipboardList size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>

          {/* User menu */}
          {session?.user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-brand-mist px-3 py-1.5">
                <User size={14} className="text-brand-blue" />
                <span className="text-sm text-brand-ink">
                  {(session.user as any).firstName || session.user.email}
                </span>
              </div>
              {/* Admin link — only shows for admin emails */}
              {(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
                .split(',')
                .map(e => e.trim().toLowerCase())
                .includes((session.user.email ?? '').toLowerCase()) && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-blue"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-brand-ink/45 transition-colors hover:text-brand-navy"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-full p-2 text-brand-ink/70 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-4 border-t border-brand-line/80 bg-white px-6 py-4 md:hidden">
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Home</Link>
          <Link href="/collections/all" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Catalog</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">About</Link>
          <Link href="/faqs" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">FAQs</Link>
          <Link href="/quotes" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Quotes</Link>
          <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Orders</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Contact</Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-left text-sm text-red-500"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
