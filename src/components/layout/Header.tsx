'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ClipboardList, User, LogOut, Menu, X } from 'lucide-react';
import { useQuoteStore } from '@/store/quote';
import { useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const { openQuote, totalItems } = useQuoteStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = totalItems();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#eeebe6]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <svg width="36" height="24" viewBox="0 0 60 36" fill="none">
            <path
              d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
              stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold text-[#111] text-lg hidden sm:block">NxGen Pharma</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-[#555] hover:text-[#111] transition-colors">Home</Link>
          <Link href="/collections/all" className="text-sm text-[#555] hover:text-[#111] transition-colors">Catalog</Link>
          <Link href="/contact" className="text-sm text-[#555] hover:text-[#111] transition-colors">Contact</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Quote button */}
          <button
            onClick={openQuote}
            className="relative p-2 text-[#555] hover:text-[#111] transition-colors"
            aria-label="Open quote"
          >
            <ClipboardList size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2b7fff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* User menu */}
          {session?.user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f7f4] rounded-lg">
                <User size={14} className="text-[#666]" />
                <span className="text-sm text-[#333]">
                  {(session.user as any).firstName || session.user.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-[#999] hover:text-[#555] transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-[#555]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#eeebe6] px-6 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm text-[#555]">Home</Link>
          <Link href="/collections/all" onClick={() => setMobileOpen(false)} className="text-sm text-[#555]">Catalog</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className="text-sm text-[#555]">Contact</Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-red-500 text-left"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
