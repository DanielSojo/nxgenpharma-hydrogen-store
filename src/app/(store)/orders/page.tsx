'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ChevronRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';
import PageHeader from '@/components/layout/PageHeader';

interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentSubtotalPrice: { amount: string; currencyCode: string };
  currentTotalShippingPrice: { amount: string; currencyCode: string };
  currentTotalTax: { amount: string; currencyCode: string };
  currentTotalPrice: { amount: string; currencyCode: string };
  lineItems: {
    nodes: Array<{
      quantity: number;
      variant?: {
        price?: { amount: string; currencyCode: string };
      };
    }>;
  };
  lineItemsCount: number;
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    PAID:        { label: 'Paid',       color: 'bg-green-100 text-green-700', icon: CheckCircle },
    PENDING:     { label: 'Pending',    color: 'bg-amber-100 text-amber-700', icon: Clock },
    FULFILLED:   { label: 'Fulfilled',  color: 'bg-blue-100 text-blue-700',   icon: Truck },
    UNFULFILLED: { label: 'Processing', color: 'bg-gray-100 text-gray-600',   icon: Clock },
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
  const { calculatePrice } = useCustomerPricing();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders ?? []);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        eyebrow="Orders"
        title="My Orders"
        icon={ShoppingBag}
        description="Review your completed orders, track fulfillment status, and revisit past purchases."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-brand-line/70 bg-white p-16 text-center shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)]">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
            <ShoppingBag size={30} />
          </span>
          <p className="mb-2 font-semibold text-brand-navy">No orders yet</p>
          <p className="mb-6 text-sm text-brand-ink/55">Your completed orders will appear here</p>
          <Link
            href="/quotes"
            className="bg-brand-gradient-navy inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            View Quotes <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const productSubtotal = (order.lineItems?.nodes ?? []).reduce((sum, item) => {
              const basePrice = item.variant?.price?.amount ?? '0';
              return sum + calculatePrice(basePrice) * item.quantity;
            }, 0);
            const shippingTotal = Number(order.currentTotalShippingPrice?.amount ?? 0);
            const taxTotal = Number(order.currentTotalTax?.amount ?? 0);
            const rawSubtotal = Number(order.currentSubtotalPrice?.amount ?? 0);
            const rawTotal = Number(order.currentTotalPrice?.amount ?? 0);
            const discountTotal = Math.max(0, rawSubtotal + shippingTotal + taxTotal - rawTotal);
            const displayTotal = productSubtotal + shippingTotal + taxTotal - discountTotal;
            const currency = order.currentTotalPrice?.currencyCode ?? order.currentSubtotalPrice?.currencyCode ?? 'USD';

            return (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}`}
                className="group flex items-center justify-between rounded-2xl border border-brand-line/70 bg-white px-6 py-5 shadow-[0_1px_8px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_16px_36px_-18px_rgba(23,50,82,0.28)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue transition-transform duration-200 group-hover:scale-105">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-2">
                      <p className="font-semibold text-brand-navy">Order #{order.orderNumber}</p>
                      <StatusBadge status={order.financialStatus} />
                    </div>
                    <p className="text-sm text-brand-ink/60">
                      {new Date(order.processedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-brand-navy">
                    {formatPrice(String(displayTotal), currency)}
                  </span>
                  <ChevronRight size={18} className="text-brand-ink/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
