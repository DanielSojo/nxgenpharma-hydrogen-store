'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Building2, TrendingUp, Loader2, ShoppingBag } from 'lucide-react';

interface SellerOrder {
  id: string;
  name: string;
  processedAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  subtotal: number;
  total: number;
  currencyCode: string;
  profit: number;
}

interface SellerClinic {
  id: string;
  name: string;
  email: string | null;
  markup: number;
  b2bStatus: string | null;
  orders: SellerOrder[];
  totalProfit: number;
}

function money(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SellerDashboard({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState<SellerClinic[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/seller/clinics', { signal: controller.signal });
        const data = await res.json();
        if (res.ok && !data.error) {
          setIsSeller(Boolean(data.isSeller));
          setClinics(data.clinics ?? []);
          setTotalProfit(data.totalProfit ?? 0);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load seller clinics', error);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [status]);

  // Loading state — small inline spinner so the page doesn't jump.
  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center rounded-3xl border border-brand-line bg-white p-8">
        <Loader2 size={18} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  // Not a seller — render nothing so regular customers see their normal profile.
  // `alwaysShow` is passed from the seller-only route, where the role is already
  // verified, so the dashboard (and its empty state) renders even with 0 clinics.
  if (!isSeller && !alwaysShow) return null;

  const currency = clinics[0]?.orders[0]?.currencyCode ?? 'USD';

  return (
    <div className="mb-8 flex flex-col gap-6">
      {/* Summary header */}
      <div className="rounded-3xl border border-brand-line bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue p-8 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp size={22} className="text-brand-teal" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-teal">Seller</p>
            <h2 className="mt-1 text-2xl font-bold">My Clinics & Profit</h2>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-white/70">Associated Clinics</p>
            <p className="mt-1 text-2xl font-bold">{clinics.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-white/70">Total Profit</p>
            <p className="mt-1 text-2xl font-bold">{money(totalProfit, currency)}</p>
          </div>
        </div>
      </div>

      {/* Per-clinic breakdown */}
      {clinics.map((clinic) => (
        <div
          key={clinic.id}
          className="overflow-hidden rounded-3xl border border-brand-line bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-brand-mist px-6 py-4">
            <div className="flex items-center gap-3">
              <Building2 size={18} className="text-brand-blue" />
              <div>
                <p className="text-[15px] font-bold text-brand-navy">{clinic.name}</p>
                {clinic.email && <p className="text-xs text-brand-ink/55">{clinic.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-brand-ink/50">Markup</p>
                <p className="text-sm font-semibold text-brand-ink">{clinic.markup}%</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-brand-ink/50">Profit</p>
                <p className="text-sm font-semibold text-brand-blue">
                  {money(clinic.totalProfit, currency)}
                </p>
              </div>
            </div>
          </div>

          {clinic.orders.length === 0 ? (
            <div className="flex items-center gap-2 px-6 py-8 text-sm text-brand-ink/55">
              <ShoppingBag size={16} /> No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-line text-left text-[11px] uppercase tracking-wide text-brand-ink/50">
                    <th className="px-6 py-3 font-semibold">Order</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 text-right font-semibold">Order Total</th>
                    <th className="px-6 py-3 text-right font-semibold">My Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {clinic.orders.map((order) => (
                    <tr key={order.id} className="border-b border-brand-line/60 last:border-0">
                      <td className="px-6 py-3 font-medium text-brand-navy">{order.name}</td>
                      <td className="px-6 py-3 text-brand-ink/70">{formatDate(order.processedAt)}</td>
                      <td className="px-6 py-3 text-brand-ink/70">{order.financialStatus ?? '—'}</td>
                      <td className="px-6 py-3 text-right text-brand-ink">
                        {money(order.total, order.currencyCode)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-brand-blue">
                        {money(order.profit, order.currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
