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
  Receipt,
  TicketPercent,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

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
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

function TrackingCard({ fulfillments }: { fulfillments: any[] }) {
  const tracked = fulfillments?.filter((f) => f.trackingInfo?.length > 0);

  if (!tracked?.length) {
    return (
      <div className="rounded-2xl border border-brand-line bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Truck size={15} className="text-brand-blue" />
          <h3 className="text-sm font-semibold text-brand-navy">Tracking</h3>
        </div>
        <p className="text-sm text-brand-ink/55">
          No tracking information yet. Check back once your order ships.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-line bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Truck size={15} className="text-brand-blue" />
        <h3 className="text-sm font-semibold text-brand-navy">Tracking</h3>
      </div>
      <div className="flex flex-col gap-4">
        {tracked.map((fulfillment, i) => (
          <div key={i} className="flex flex-col gap-2">
            {fulfillment.trackingCompany && (
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/50">
                {fulfillment.trackingCompany}
              </p>
            )}
            {fulfillment.trackingInfo.map((info: any, j: number) => (
              <div key={j} className="flex items-center justify-between rounded-xl bg-brand-mist px-4 py-3">
                <span className="font-mono text-xs text-brand-navy">{info.number}</span>
                {info.url && (
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-blue hover:underline"
                  >
                    Track →
                  </a>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { calculatePrice } = useCustomerPricing();

  function formatMoney(amount: string | number | undefined, currencyCode = 'USD') {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount ?? 0);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(numericAmount);
  }

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
        <Link href="/orders" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-ink/65 hover:text-brand-navy">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const lineItems = order.lineItems?.nodes ?? [];
  const shippingAddress = order.shippingAddress;
  const fulfillments = order.fulfillments ?? [];
  const shippingLines = order.shippingLines ?? [];
  const discountCodes = order.discountCodes ?? [];
  const tags = order.tags ?? [];
  const summary = order.summary ?? {
    subtotal: order.currentTotalPrice?.amount ?? '0',
    shipping: '0',
    tax: '0',
    discounts: '0',
    total: order.currentTotalPrice?.amount ?? '0',
    currency: order.currentTotalPrice?.currencyCode ?? 'USD',
  };
  const currency =
    order.currentTotalPrice?.currencyCode ??
    order.currentTotalShippingPrice?.currencyCode ??
    order.currentTotalTax?.currencyCode ??
    summary.currency ??
    'USD';
  const productSubtotal = lineItems.reduce((sum: number, item: any) => {
    const basePrice = item.variant?.price?.amount ?? '0';
    return sum + calculatePrice(basePrice) * item.quantity;
  }, 0);
  const shippingTotal = Number(order.currentTotalShippingPrice?.amount ?? summary.shipping ?? 0);
  const taxTotal = Number(order.currentTotalTax?.amount ?? summary.tax ?? 0);
  const rawOrderSubtotal = Number(order.currentSubtotalPrice?.amount ?? summary.subtotal ?? 0);
  const rawOrderTotal = Number(order.currentTotalPrice?.amount ?? summary.total ?? 0);
  const discountTotal = Math.max(0, rawOrderSubtotal + shippingTotal + taxTotal - rawOrderTotal);
  const orderTotal = productSubtotal + shippingTotal + taxTotal - discountTotal;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/orders"
        className="mb-8 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-mist via-white to-brand-surface p-8 ring-1 ring-brand-line">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">Order Detail</p>
            <h1 className="text-2xl font-bold text-brand-navy">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-brand-ink/65">
              {new Date(order.processedAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-sm text-brand-ink/65">Total</p>
            <p className="text-2xl font-bold text-brand-navy">
              {formatMoney(orderTotal, currency)}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <StatusBadge status={order.financialStatus} />
              <StatusBadge status={order.fulfillmentStatus} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Products */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
            <div className="flex items-center gap-2 border-b border-brand-line px-6 py-4">
              <Package size={16} className="text-brand-blue" />
              <h2 className="font-semibold text-brand-navy">Products ({lineItems.length})</h2>
            </div>
            <div className="divide-y divide-brand-line/60">
              {lineItems.map((item: any, index: number) => {
                const variantPrice = item.variant?.price;
                const lineTotal = variantPrice
                  ? calculatePrice(variantPrice.amount) * item.quantity
                  : 0;
                return (
                  <div key={`${item.title}-${index}`} className="flex gap-4 px-6 py-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-brand-line bg-brand-mist">
                      {item.variant?.image?.url ? (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.image.altText ?? item.title}
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
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
                        <span className="text-sm text-brand-ink/65">
                          Qty: {item.quantity}
                        </span>
                        {variantPrice && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-brand-navy">
                              {formatMoney(lineTotal, variantPrice.currencyCode)}
                            </p>
                            <p className="text-xs text-brand-ink/50">
                              {formatMoney(calculatePrice(variantPrice.amount), variantPrice.currencyCode)} each
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-brand-line bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={15} className="text-brand-blue" />
              <h3 className="text-sm font-semibold text-brand-navy">Order Summary</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-ink/72">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="font-semibold text-brand-navy">{formatMoney(productSubtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Shipping</span>
                <span className="font-semibold text-brand-navy">{formatMoney(shippingTotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Tax</span>
                <span className="font-semibold text-brand-navy">{formatMoney(taxTotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Discount</span>
                <span className="font-semibold text-emerald-700">-{formatMoney(discountTotal, currency)}</span>
              </div>
              <div className="border-t border-brand-line pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-brand-navy">Order Total</span>
                  <span className="text-base font-bold text-brand-navy">{formatMoney(orderTotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {(shippingLines.length > 0 || discountCodes.length > 0 || order.note || tags.length > 0) && (
            <div className="rounded-2xl border border-brand-line bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <TicketPercent size={15} className="text-brand-blue" />
                <h3 className="text-sm font-semibold text-brand-navy">Order Info</h3>
              </div>
              <div className="flex flex-col gap-4 text-sm text-brand-ink/72">
                {shippingLines.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-ink/45">Shipping Method</p>
                    <div className="flex flex-col gap-2">
                      {shippingLines.map((line: any, index: number) => (
                        <div key={`${line.title}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-brand-mist px-4 py-3">
                          <div>
                            <p className="font-semibold text-brand-navy">{line.title}</p>
                            {line.code && <p className="text-xs text-brand-ink/55">{line.code}</p>}
                          </div>
                          <span className="font-semibold text-brand-navy">{formatMoney(line.price, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {discountCodes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-ink/45">Discounts</p>
                    <div className="flex flex-col gap-2">
                      {discountCodes.map((discount: any, index: number) => (
                        <div key={`${discount.code}-${index}`} className="rounded-xl bg-emerald-50 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-emerald-800">{discount.code}</p>
                            <span className="font-semibold text-emerald-800">
                              {discount.type === 'percentage'
                                ? `${Number(discount.amount ?? 0)}%`
                                : formatMoney(discount.amount, currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.note && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-ink/45">Order Note</p>
                    <p className="rounded-xl bg-brand-mist px-4 py-3 leading-relaxed text-brand-ink/72">{order.note}</p>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-ink/45">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-navy">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {shippingAddress && (
            <div className="rounded-2xl border border-brand-line bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-brand-blue" />
                <h3 className="text-sm font-semibold text-brand-navy">Ship To</h3>
              </div>
              <p className="text-sm leading-relaxed text-brand-ink/72">
                {shippingAddress.firstName} {shippingAddress.lastName}<br />
                {shippingAddress.address1}<br />
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}<br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          <TrackingCard fulfillments={fulfillments} />

          <div className="rounded-2xl border border-brand-line bg-brand-mist p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-blue">Status</p>
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
