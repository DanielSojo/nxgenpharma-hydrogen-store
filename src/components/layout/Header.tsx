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
  const isSeller = ((session?.user as any)?.role ?? '').toLowerCase() === 'seller';

  return (
    <header className="sticky top-0 z-40 border-b border-brand-line/60 bg-white/80 shadow-[0_8px_30px_-22px_rgba(23,50,82,0.45)] backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/nxgenpharma-logo.png" width={70} height={40} alt="NexGen Pharma Logo" />
          <span className="hidden text-lg font-bold text-brand-navy sm:block">NexGen Pharma</span>
        </Link>

        {/* Desktop Nav */}
        {session?.user && (
          <nav className="hidden md:flex items-center gap-8">
            {isSeller ? (
              <Link href="/seller-dashboard" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Dashboard</Link>
            ) : (
              <>
                <Link href="/" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Home</Link>
                <Link href="/collections/all" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Catalog</Link>
                <Link href="/about" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">About</Link>
                <Link href="/faqs" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">FAQs</Link>
                <Link href="/quotes" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Quotes</Link>
                <Link href="/orders" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Orders</Link>
                <Link href="/profile" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Profile</Link>
                <Link href="/contact" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">Contact</Link>
              </>
            )}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Quote button */}
          {session?.user && !isSeller && (
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
          )}

          {/* User menu */}
          {session?.user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href={isSeller ? '/seller-dashboard' : '/profile'} className="flex items-center gap-2 rounded-full border border-brand-line/70 bg-brand-mist px-3 py-1.5 transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:bg-white hover:shadow-sm">
                <User size={14} className="text-brand-blue" />
                <span className="text-sm text-brand-ink">
                  {(session.user as any).firstName || session.user.email}
                </span>
              </Link>
              {/* Admin link — only shows for admin emails */}
              {(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
                .split(',')
                .map(e => e.trim().toLowerCase())
                .includes((session.user.email ?? '').toLowerCase()) && (
                <Link
                  href="/admin"
                  className="bg-brand-gradient rounded-full px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-brand-ink/45 transition-colors hover:text-brand-navy"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login?callbackUrl=/collections/all"
              className="bg-brand-gradient hidden rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:inline-flex"
            >
              Login
            </Link>
          )}

          {/* Mobile menu toggle */}
          {session?.user && (
            <button
              className="rounded-full p-2 text-brand-ink/70 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {session?.user && mobileOpen && (
        <div className="flex flex-col gap-4 border-t border-brand-line/80 bg-white px-6 py-4 md:hidden">
          {isSeller ? (
            <Link href="/seller-dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Dashboard</Link>
          ) : (
            <>
              <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Home</Link>
              <Link href="/collections/all" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Catalog</Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">About</Link>
              <Link href="/faqs" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">FAQs</Link>
              <Link href="/quotes" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Quotes</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Orders</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Profile</Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">Contact</Link>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-left text-sm text-red-500"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
