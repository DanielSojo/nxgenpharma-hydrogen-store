'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ClipboardList, Package, MapPin, FileText } from 'lucide-react';

function formatPrice(amount: string | number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
}

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setQuote(data.quote);
      })
      .catch(() => setError('Failed to load quote'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
          {error || 'Quote not found'}
        </div>
        <Link href="/quotes" className="mt-4 inline-flex items-center gap-2 text-sm text-brand-ink/65 hover:text-brand-navy">
          <ArrowLeft size={16} /> Back to Quotes
        </Link>
      </div>
    );
  }

  // Parse quote number from note
  const quoteNumberMatch = quote.note?.match(/Quote Number: (Q\S+)/);
  const quoteNumber = quoteNumberMatch?.[1] ?? quote.name;

  // Parse customer notes only (hide markup info)
  const customerNotesMatch = quote.note?.match(/Customer Notes: (.+)/);
  const customerNotes = customerNotesMatch?.[1];

  const lineItems = quote.line_items ?? [];
  const shippingAddress = quote.shipping_address;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Back */}
      <Link
        href="/quotes"
        className="mb-8 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-aqua">
              Quote Request
            </p>
            <h1 className="text-2xl font-bold mb-1">{quoteNumber}</h1>
            <p className="text-sm text-white/70">
              {new Date(quote.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-sm text-white/70">Total</p>
            <p className="text-2xl font-bold">
              {formatPrice(quote.total_price, quote.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Products ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
            <div className="flex items-center gap-2 border-b border-brand-line px-6 py-4">
              <Package size={16} className="text-brand-blue" />
              <h2 className="font-semibold text-brand-navy">
                Products ({lineItems.length})
              </h2>
            </div>

            <div className="divide-y divide-brand-line/60">
              {lineItems.map((item: any, index: number) => {
                const itemPrice = parseFloat(item.price);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={index} className="px-6 py-4 flex gap-4">
                    {/* Image */}
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-brand-line bg-brand-mist">
                      {item._image ? (
                        <Image
                          src={item._image}
                          alt={item.title}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-brand-ink/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy">{item.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-brand-ink/65">
                          Qty: {item.quantity} × {formatPrice(item.price, quote.currency)}
                        </span>
                        <span className="text-sm font-bold text-brand-navy">
                          {formatPrice(String(itemTotal), quote.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="border-t border-brand-line bg-brand-surface px-6 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-ink/65">Subtotal</span>
                <span className="font-bold text-brand-navy">
                  {formatPrice(quote.subtotal_price, quote.currency)}
                </span>
              </div>
              {quote.shipping_line && parseFloat(quote.shipping_line.price ?? '0') > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-brand-ink/65">
                    Shipping — {quote.shipping_line.title}
                  </span>
                  <span className="text-sm text-brand-ink">
                    {formatPrice(quote.shipping_line.price, quote.currency)}
                  </span>
                </div>
              )}
              {parseFloat(quote.total_tax ?? '0') > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-brand-ink/65">Tax</span>
                  <span className="text-sm text-brand-ink">
                    {formatPrice(quote.total_tax, quote.currency)}
                  </span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-brand-line pt-3">
                <span className="font-bold text-brand-navy">Total</span>
                <span className="text-lg font-bold text-brand-navy">
                  {formatPrice(quote.total_price, quote.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="flex flex-col gap-4">

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="rounded-2xl border border-brand-line bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-brand-blue" />
                <h3 className="text-sm font-semibold text-brand-navy">Ship To</h3>
              </div>
              <p className="text-sm leading-relaxed text-brand-ink/72">
                {shippingAddress.first_name} {shippingAddress.last_name}<br />
                {shippingAddress.address1}<br />
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}<br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          {/* Customer Notes */}
          {customerNotes && (
            <div className="rounded-2xl border border-brand-line bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={15} className="text-brand-blue" />
                <h3 className="text-sm font-semibold text-brand-navy">Your Notes</h3>
              </div>
              <p className="text-sm leading-relaxed text-brand-ink/72">{customerNotes}</p>
            </div>
          )}

          {/* Status */}
          <div className="rounded-2xl border border-brand-line bg-brand-mist p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-blue">
              Status
            </p>
            <p className="text-sm font-semibold text-brand-navy">
              Under Review
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-ink/65">
              Our team is reviewing your quote. You'll receive an email when it's ready.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-brand-line bg-white p-5 text-center">
            <p className="mb-3 text-sm text-brand-ink/72">Questions about this quote?</p>
            <Link
              href="/contact"
              className="inline-block w-full rounded-full border-2 border-brand-navy py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
            >
              Contact Us
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
