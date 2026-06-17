'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ClipboardList, User, LogOut, Menu, X, ChevronDown, UserCircle2, ShoppingBag, TrendingUp } from 'lucide-react';
import { useQuoteStore } from '@/store/quote';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();
  const { openQuote, totalItems } = useQuoteStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemCount = totalItems();
  const isSeller = ((session?.user as any)?.role ?? '').toLowerCase() === 'seller';

  // Close the account dropdown on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const accountName =
    (session?.user as any)?.firstName || session?.user?.email || 'Account';

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
                <Link href="/coa" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">COAs</Link>
                <Link href="/faqs" className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy">FAQs</Link>
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
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-brand-line/70 bg-brand-mist py-1.5 pl-3 pr-2.5 transition-all hover:border-brand-blue/40 hover:bg-white hover:shadow-sm"
              >
                <User size={14} className="text-brand-blue" />
                <span className="max-w-[140px] truncate text-sm text-brand-ink">{accountName}</span>
                <ChevronDown
                  size={15}
                  className={`text-brand-ink/50 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="animate-fade-up absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-brand-line/70 bg-white shadow-[0_22px_50px_-20px_rgba(23,50,82,0.42)]"
                >
                  <div className="border-b border-brand-line/60 bg-brand-surface px-4 py-3">
                    <p className="truncate text-sm font-semibold text-brand-navy">{accountName}</p>
                    {session.user.email && (
                      <p className="truncate text-xs text-brand-ink/55">{session.user.email}</p>
                    )}
                  </div>

                  <div className="flex flex-col p-1.5">
                    {isSeller ? (
                      <Link href="/seller-dashboard" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-mist hover:text-brand-navy">
                        <TrendingUp size={16} className="text-brand-blue" /> Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link href="/profile" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-mist hover:text-brand-navy">
                          <UserCircle2 size={16} className="text-brand-blue" /> Profile
                        </Link>
                        <Link href="/orders" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-mist hover:text-brand-navy">
                          <ShoppingBag size={16} className="text-brand-blue" /> Orders
                        </Link>
                        <Link href="/quotes" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-ink/80 transition-colors hover:bg-brand-mist hover:text-brand-navy">
                          <ClipboardList size={16} className="text-brand-blue" /> Quotes
                        </Link>
                      </>
                    )}

                    {(process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
                      .split(',')
                      .map((e) => e.trim().toLowerCase())
                      .includes((session.user.email ?? '').toLowerCase()) && (
                      <Link href="/admin" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-mist">
                        <User size={16} /> Admin
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-brand-line/60 p-1.5">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </div>
              )}
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
              <Link href="/coa" onClick={() => setMobileOpen(false)} className="text-sm text-brand-ink/70">COAs</Link>
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
