'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  ArrowRight,
  UserCircle2,
  Boxes,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

interface Stats {
  quotes: number | null;
  orders: number | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({ quotes: null, orders: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = session?.user as any;
  const firstName = user?.firstName || (session?.user?.email ?? '').split('@')[0] || 'there';
  const role = (user?.role ?? '').toString();

  useEffect(() => {
    if (!session) return;

    Promise.all([
      fetch('/api/quotes').then((r) => r.json()),
      fetch('/api/orders').then((r) => r.json()),
    ])
      .then(([quoteData, orderData]) => {
        setStats({
          quotes: Array.isArray(quoteData?.quotes) ? quoteData.quotes.length : 0,
          orders: Array.isArray(orderData?.orders) ? orderData.orders.length : 0,
        });
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, [session]);

  const statCards = [
    {
      label: 'Total Quotes',
      value: stats.quotes,
      icon: ClipboardList,
      href: '/quotes',
      cta: 'View quotes',
    },
    {
      label: 'Total Orders',
      value: stats.orders,
      icon: ShoppingBag,
      href: '/orders',
      cta: 'View orders',
    },
  ];

  const quickLinks = [
    { href: '/collections/all', label: 'Browse Catalog', icon: Boxes },
    { href: '/quotes', label: 'My Quotes', icon: ClipboardList },
    { href: '/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/profile', label: 'Profile Settings', icon: UserCircle2 },
  ];

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        icon={LayoutDashboard}
        description="Here's an overview of your account activity. Review your quotes and orders, or jump back into the catalog to request a new quote."
        meta={
          <>
            {session?.user?.email && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-medium">
                {session.user.email}
              </span>
            )}
            {role && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-medium capitalize">
                {role} account
              </span>
            )}
          </>
        }
      />

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2">
        {statCards.map(({ label, value, icon: Icon, href, cta }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-3xl border border-brand-line/70 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_22px_48px_-20px_rgba(23,50,82,0.3)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                  {label}
                </p>
                {loading || value === null ? (
                  <div className="mt-3 h-10 w-16 animate-pulse rounded-lg bg-brand-mist" />
                ) : (
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-brand-navy">
                    {value}
                  </p>
                )}
              </div>
              <span className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md shadow-brand-blue/25">
                <Icon size={22} />
              </span>
            </div>
            <Link
              href={href}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy"
            >
              {cta}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-brand-ink/55">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-brand-line/70 bg-white px-5 py-4 shadow-[0_1px_8px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_16px_36px_-18px_rgba(23,50,82,0.28)]"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue transition-transform duration-200 group-hover:scale-105">
                <Icon size={18} />
              </span>
              <span className="text-sm font-semibold text-brand-navy">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
