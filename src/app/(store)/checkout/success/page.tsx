'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  MapPin,
  Receipt,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useCartStore } from '@/store/cart';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';
import { clearPendingCheckout, readPendingCheckout } from '@/lib/checkout';
import type { CheckoutOrder } from '@/types';

const POLL_INTERVAL_MS = 2_500;
const POLL_TIMEOUT_MS = 90_000;

type Status = 'resolving' | 'found' | 'timeout' | 'missing' | 'error';

function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const { formatCalculatedPrice } = useCustomerPricing();

  const [status, setStatus] = useState<Status>('resolving');
  const [order, setOrder] = useState<CheckoutOrder | null>(null);

  // Cart clearing must happen exactly once, and only after Shopify confirms the
  // order — an abandoned checkout should leave the cart intact.
  const clearedRef = useRef(false);
  const clearCartOnce = useCallback(() => {
    if (clearedRef.current) return;
    clearedRef.current = true;
    clearCart();
    clearPendingCheckout();
  }, [clearCart]);

  // Depend on the string, not the params object, so re-renders from setState
  // can never restart the poll.
  const refParam = searchParams.get('ref');

  useEffect(() => {
    const pending = readPendingCheckout();
    const ref = refParam ?? pending?.ref ?? null;
    const since = pending?.startedAt ?? null;

    if (!ref && !since) {
      setStatus('missing');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    const poll = async () => {
      try {
        const params = new URLSearchParams();
        if (ref) params.set('ref', ref);
        if (since) params.set('since', since);

        const res = await fetch(`/api/orders/lookup?${params.toString()}`);
        if (cancelled) return;

        if (!res.ok) {
          setStatus('error');
          return;
        }

        const json = await res.json();
        if (cancelled) return;

        if (json.status === 'found') {
          setOrder(json.order as CheckoutOrder);
          setStatus('found');
          clearCartOnce();
          return;
        }

        if (Date.now() >= deadline) {
          // Payment may still be settling on Shopify's side; the order will
          // land under /orders shortly. Don't touch the cart in this branch.
          setStatus('timeout');
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refParam, clearCartOnce]);

  if (status === 'resolving') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
        <p className="text-sm text-brand-ink/70">Confirming your order with Shopify…</p>
      </div>
    );
  }

  if (status !== 'found' || !order) {
    const messages: Record<Status, { title: string; body: string }> = {
      timeout: {
        title: 'Payment received — order still processing',
        body: 'Shopify is still finalizing your order. It will appear under your orders in a few moments.',
      },
      missing: {
        title: 'No recent checkout found',
        body: "We couldn't find a checkout to confirm. If you just paid, your order will be listed under your orders.",
      },
      error: {
        title: "We couldn't load your order",
        body: 'Your payment may still have gone through. Please check your orders before trying again.',
      },
      // Reachable only if the lookup returned a match without an order payload.
      found: {
        title: 'Order confirmed',
        body: 'Your order went through. You can review the details under your orders.',
      },
      resolving: { title: '', body: '' },
    };
    const copy = messages[status];

    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-3xl border border-brand-line/70 bg-white p-8 text-center shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock size={26} />
          </span>
          <h1 className="text-xl font-bold text-brand-navy">{copy.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-ink/70">{copy.body}</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/orders"
              className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <ShoppingBag size={16} /> View my orders
            </Link>
            <Link
              href="/collections/all"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lines = order.lineItems?.nodes ?? [];
  const address = order.shippingAddress;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <PageHeader
        eyebrow="Order confirmed"
        title={`Thank you — order ${order.name}`}
        icon={CheckCircle2}
        description="Your payment went through and your order is now with our fulfillment team. A confirmation email is on its way."
        meta={
          <>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
              {new Date(order.processedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {order.financialStatus && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                {order.financialStatus.toLowerCase()}
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
              {lines.reduce((total, line) => total + line.quantity, 0)} item(s)
            </span>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Items */}
        <div className="rounded-2xl border border-brand-line/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
          <div className="mb-4 flex items-center gap-2">
            <Package size={15} className="text-brand-blue" />
            <h2 className="text-sm font-semibold text-brand-navy">Items</h2>
          </div>
          <div className="flex flex-col gap-4">
            {lines.map((line, index) => (
              <div key={`${line.title}-${index}`} className="flex gap-4">
                <div className="bg-catalog-hero relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
                  {line.variant?.image ? (
                    <Image
                      src={line.variant.image.url}
                      alt={line.variant.image.altText ?? line.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain p-1.5 [filter:drop-shadow(0_6px_8px_rgba(0,0,0,0.55))]"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <p className="text-sm font-semibold text-brand-navy">{line.title}</p>
                  {line.variant?.title && line.variant.title !== 'Default Title' && (
                    <p className="text-xs text-brand-ink/70">{line.variant.title}</p>
                  )}
                  <p className="text-xs text-brand-ink/70">Qty {line.quantity}</p>
                </div>
                {line.variant?.price && (
                  <p className="self-center text-sm font-bold text-brand-navy">
                    {formatCalculatedPrice(line.variant.price.amount, line.variant.price.currencyCode)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary + address */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brand-line/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
            <div className="mb-4 flex items-center gap-2">
              <Receipt size={15} className="text-brand-blue" />
              <h2 className="text-sm font-semibold text-brand-navy">Summary</h2>
            </div>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-ink/70">Subtotal</dt>
                <dd className="font-medium text-brand-ink">
                  {formatCalculatedPrice(
                    order.currentSubtotalPrice.amount,
                    order.currentSubtotalPrice.currencyCode
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-ink/70">Shipping</dt>
                <dd className="font-medium text-brand-ink">
                  {formatCalculatedPrice(
                    order.currentTotalShippingPrice.amount,
                    order.currentTotalShippingPrice.currencyCode
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-ink/70">Tax</dt>
                <dd className="font-medium text-brand-ink">
                  {formatCalculatedPrice(
                    order.currentTotalTax.amount,
                    order.currentTotalTax.currencyCode
                  )}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-brand-line/70 pt-3">
                <dt className="font-semibold text-brand-navy">Total</dt>
                <dd className="text-lg font-bold text-brand-navy">
                  {formatCalculatedPrice(
                    order.currentTotalPrice.amount,
                    order.currentTotalPrice.currencyCode
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {address && (
            <div className="rounded-2xl border border-brand-line/70 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
              <div className="mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-brand-blue" />
                <h2 className="text-sm font-semibold text-brand-navy">Shipping to</h2>
              </div>
              <address className="text-sm not-italic leading-relaxed text-brand-ink/70">
                {[address.firstName, address.lastName].filter(Boolean).join(' ')}
                <br />
                {address.address1}
                <br />
                {[address.city, address.province, address.zip].filter(Boolean).join(', ')}
                <br />
                {address.country}
              </address>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/orders/${order.orderNumber}`}
          className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <ShoppingBag size={16} /> View order details
        </Link>
        <Link
          href="/collections/all"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
        >
          Continue shopping
        </Link>
        {order.statusUrl && (
          <a
            href={order.statusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-brand-ink/70 transition-colors hover:text-brand-navy"
          >
            Shopify receipt <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-brand-blue" />
        </div>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}
