'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ChevronRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={24} className="text-[#111]" />
        <h1 className="text-2xl font-bold text-[#111]">My Orders</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#3296d2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#eeebe6] rounded-2xl p-16 text-center">
          <ShoppingBag size={40} className="text-[#ddd] mx-auto mb-4" />
          <p className="text-[#999] font-medium mb-2">No orders yet</p>
          <p className="text-[#bbb] text-sm mb-6">Your completed orders will appear here</p>
          <Link
            href="/quotes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#191b4e] text-white rounded-full text-sm font-semibold hover:bg-[#3296d2] transition-colors"
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
                className="bg-white border border-[#eeebe6] rounded-2xl px-6 py-5 flex items-center justify-between hover:border-[#3296d2] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={18} className="text-[#666]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-[#111]">Order #{order.orderNumber}</p>
                      <StatusBadge status={order.financialStatus} />
                    </div>
                    <p className="text-sm text-[#666]">
                      {new Date(order.processedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#111]">
                    {formatPrice(String(displayTotal), currency)}
                  </span>
                  <ChevronRight size={18} className="text-[#ccc] group-hover:text-[#3296d2] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
