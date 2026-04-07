'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';

function formatPrice(amount: string, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(parseFloat(amount));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    PAID: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    FULFILLED: { label: 'Fulfilled', color: 'bg-blue-100 text-blue-700', icon: Truck },
    UNFULFILLED: { label: 'Processing', color: 'bg-gray-100 text-gray-600', icon: Clock },
  };
  const config = map[status] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-600',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.color}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error || 'Order not found'}
        </div>
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center gap-2 text-sm text-brand-ink/65 hover:text-brand-navy"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const lineItems = order.lineItems?.nodes ?? [];
  const shippingAddress = order.shippingAddress;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/orders"
        className="mb-8 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-mist via-white to-brand-surface p-8 ring-1 ring-brand-line">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
              Order Detail
            </p>
            <h1 className="text-2xl font-bold text-brand-navy">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-brand-ink/65">
              {new Date(order.processedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="text-right">
            <p className="mb-1 text-sm text-brand-ink/65">Total</p>
            <p className="text-2xl font-bold text-brand-navy">
              {formatPrice(
                order.currentTotalPrice.amount,
                order.currentTotalPrice.currencyCode
              )}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <StatusBadge status={order.financialStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
            <div className="flex items-center gap-2 border-b border-brand-line px-6 py-4">
              <Package size={16} className="text-brand-blue" />
              <h2 className="font-semibold text-brand-navy">
                Products ({lineItems.length})
              </h2>
            </div>

            <div className="divide-y divide-brand-line/60">
              {lineItems.map((item: any, index: number) => {
                const variantPrice = item.variant?.price;

                return (
                  <div key={`${item.title}-${index}`} className="flex gap-4 px-6 py-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-brand-line bg-brand-mist">
                      {item.variant?.image?.url ? (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.image.altText ?? item.title}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag size={20} className="text-brand-ink/30" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-navy">{item.title}</p>
                      {item.variant?.title && item.variant.title !== 'Default Title' && (
                        <p className="mt-0.5 text-xs text-brand-ink/50">{item.variant.title}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-brand-ink/65">Qty: {item.quantity}</span>
                        {variantPrice && (
                          <span className="text-sm font-bold text-brand-navy">
                            {formatPrice(variantPrice.amount, variantPrice.currencyCode)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {shippingAddress && (
            <div className="rounded-2xl border border-brand-line bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-brand-blue" />
                <h3 className="text-sm font-semibold text-brand-navy">Ship To</h3>
              </div>
              <p className="text-sm leading-relaxed text-brand-ink/72">
                {shippingAddress.firstName} {shippingAddress.lastName}
                <br />
                {shippingAddress.address1}
                <br />
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}
                <br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-brand-line bg-brand-mist p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-blue">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.financialStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-brand-ink/65">
              Review payment and fulfillment progress for this order here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
