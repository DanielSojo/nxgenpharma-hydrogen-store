'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ChevronRight, CheckCircle, Clock, Truck } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  lineItemsCount: number;
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    PAID: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    FULFILLED: { label: 'Fulfilled', color: 'bg-blue-100 text-blue-700', icon: Truck },
    UNFULFILLED: { label: 'Processing', color: 'bg-gray-100 text-gray-600', icon: Clock },
  };
  const config = map[status] ?? { label: status, color: 'bg-gray-100 text-gray-600', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          const sortedOrders = [...(data.orders ?? [])].sort(
            (a, b) =>
              new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
          );
          setOrders(sortedOrders);
        }
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-mist via-white to-brand-surface p-8 ring-1 ring-brand-line">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-brand-blue" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">Account</p>
            <h1 className="mt-2 text-2xl font-bold text-brand-navy">My Orders</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-ink/72">
          Track completed orders, review financial status, and keep up with fulfillment progress.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-brand-line bg-white p-16 text-center">
          <ShoppingBag size={40} className="mx-auto mb-4 text-brand-line" />
          <p className="mb-2 font-medium text-brand-ink/60">No orders yet</p>
          <p className="mb-6 text-sm text-brand-ink/40">Your completed orders will appear here</p>
          <Link
            href="/quotes"
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue"
          >
            View Quotes <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.orderNumber}`}
              className="group flex items-center justify-between rounded-2xl border border-brand-line bg-white px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                  <ShoppingBag size={18} className="text-brand-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-brand-navy">Order #{order.orderNumber}</p>
                    <StatusBadge status={order.financialStatus} />
                  </div>
                  <p className="text-sm text-brand-ink/65">
                    {new Date(order.processedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-brand-navy">
                  {formatPrice(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                </span>
                <ChevronRight size={18} className="text-brand-ink/30 transition-colors group-hover:text-brand-blue" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
