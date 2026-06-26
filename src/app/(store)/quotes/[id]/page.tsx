'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ClipboardList, Package, MapPin, FileText, Download, BadgePercent } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

export default function QuoteDetailPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatCalculatedPrice, calculatePrice } = useCustomerPricing();

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
        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
          {error || 'Quote not found'}
        </div>
        <Link href="/quotes" className="inline-flex items-center gap-2 mt-4 text-sm text-brand-ink/60 hover:text-brand-navy">
          <ArrowLeft size={16} /> Back to Quotes
        </Link>
      </div>
    );
  }

  const quoteNumber = quote._quoteNumber ?? quote.name;
  const customerNotesMatch = quote.note?.match(/Customer Notes: (.+)/);
  const customerNotes = customerNotesMatch?.[1];
  const lineItems = quote.line_items ?? [];
  const shippingAddress = quote.shipping_address;
  const hasTax = parseFloat(quote.total_tax ?? '0') > 0;
  const hasShipping = quote.shipping_line && parseFloat(quote.shipping_line.price ?? '0') > 0;

  // Order totals
  const subtotal = lineItems.reduce((sum: number, item: any) => {
    return sum + calculatePrice(item.price) * item.quantity;
  }, 0);
  const tax = hasTax ? calculatePrice(quote.total_tax) : 0;
  const shipping = hasShipping ? calculatePrice(quote.shipping_line.price) : 0;
  const total = subtotal + tax + shipping;

  // Zelle payments receive 3% off the total
  const ZELLE_DISCOUNT = 0.03;
  const zelleTotal = total * (1 - ZELLE_DISCOUNT);
  const zelleSavings = total - zelleTotal;
  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(amount);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Back + Download */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/quotes" className="inline-flex items-center gap-2 text-brand-ink/55 hover:text-brand-navy text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Quotes
        </Link>
        <a
          href={`/api/quotes/${id}/pdf`}
          download
          className="bg-brand-gradient-navy inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Download size={14} />
          Download PDF
        </a>
      </div>

      {/* Header */}
      <div className="bg-catalog-hero relative mb-6 overflow-hidden rounded-3xl p-8 text-white shadow-[0_22px_48px_-22px_rgba(26,29,109,0.55)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-aqua/20 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-aqua">Quote Request</p>
            <h1 className="mb-1 text-2xl font-bold">{quoteNumber}</h1>
            <p className="text-sm text-white/60">
              {new Date(quote.created_at).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <div className="relative text-right">
            <p className="mb-1 text-sm text-white/60">Total</p>
            <p className="text-2xl font-bold text-brand-aqua">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Products ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-brand-line/70 rounded-2xl shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)] overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-line/70 flex items-center gap-2">
              <Package size={16} className="text-brand-ink/60" />
              <h2 className="font-semibold text-brand-navy">Products ({lineItems.length})</h2>
            </div>

            <div className="divide-y divide-brand-line/60">
              {lineItems.map((item: any, index: number) => {
                const unitPrice = calculatePrice(item.price);
                const rowTotal = unitPrice * item.quantity;

                return (
                  <div key={index} className="px-6 py-4 flex gap-4">
                    {/* Image */}
                    <div className="bg-catalog-hero w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border border-white/10">
                      {item._image ? (
                        <Image
                          src={item._image}
                          alt={item.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain p-1 [filter:drop-shadow(0_5px_7px_rgba(0,0,0,0.55))]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-brand-ink/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy text-sm">{item.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-brand-ink/60">
                          Qty: {item.quantity} × {formatCalculatedPrice(item.price, quote.currency)}
                        </span>
                        <span className="font-bold text-brand-navy text-sm">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(rowTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-brand-surface border-t border-brand-line/70">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-ink/60">Subtotal</span>
                <span className="font-bold text-brand-navy">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(subtotal)}
                </span>
              </div>
              {hasShipping && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-brand-ink/60">Shipping — {quote.shipping_line.title}</span>
                  <span className="text-sm text-brand-ink">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(shipping)}
                  </span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-brand-ink/60">Tax</span>
                  <span className="text-sm text-brand-ink">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(tax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-brand-line/70">
                <span className="font-bold text-brand-navy">Total</span>
                <span className="text-lg font-bold text-brand-blue">
                  {fmtCurrency(total)}
                </span>
              </div>

              {/* Zelle discount */}
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-emerald-300/60 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 p-5 shadow-[0_8px_28px_-12px_rgba(5,150,105,0.5)]">
                {/* glow accents */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-teal-400/15 blur-2xl" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/30">
                      <BadgePercent size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Pay with Zelle</p>
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                        Save 3%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-700/70 line-through">
                      {fmtCurrency(total)}
                    </p>
                    <p className="text-xl font-extrabold text-emerald-700">
                      {fmtCurrency(zelleTotal)}
                    </p>
                  </div>
                </div>

                <p className="relative mt-3 text-xs leading-relaxed text-emerald-800/90">
                  Skip the card fees &mdash; pay this quote with Zelle and instantly save{' '}
                  <span className="font-bold text-emerald-900">{fmtCurrency(zelleSavings)}</span>.
                  Just mention &ldquo;Zelle&rdquo; when confirming your order and our team will share the payment details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex flex-col gap-4">
          {shippingAddress && (
            <div className="bg-white border border-brand-line/70 rounded-2xl shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-brand-ink/60" />
                <h3 className="font-semibold text-brand-navy text-sm">Ship To</h3>
              </div>
              <p className="text-sm text-brand-ink/65 leading-relaxed">
                {shippingAddress.first_name} {shippingAddress.last_name}<br />
                {shippingAddress.address1}<br />
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}<br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          {customerNotes && (
            <div className="bg-white border border-brand-line/70 rounded-2xl shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={15} className="text-brand-ink/60" />
                <h3 className="font-semibold text-brand-navy text-sm">Your Notes</h3>
              </div>
              <p className="text-sm text-brand-ink/65 leading-relaxed">{customerNotes}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Status</p>
            <p className="text-sm text-amber-800 font-semibold">Under Review</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              Our team is reviewing your quote. You'll receive an email when it's ready.
            </p>
          </div>

          <div className="bg-white border border-brand-line/70 rounded-2xl shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)] p-5 text-center">
            <p className="text-sm text-brand-ink/65 mb-3">Questions about this quote?</p>
            <Link
              href="/contact"
              className="inline-block w-full rounded-full border-2 border-brand-navy/80 py-2.5 text-sm font-semibold text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy hover:bg-brand-navy hover:text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}