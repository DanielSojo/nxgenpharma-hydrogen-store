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
        <div className="w-6 h-6 border-2 border-[#2b7fff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
          {error || 'Quote not found'}
        </div>
        <Link href="/quotes" className="inline-flex items-center gap-2 mt-4 text-sm text-[#666] hover:text-[#111]">
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
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#333] text-sm transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      {/* Header */}
      <div className="bg-[#0a0a0a] text-white rounded-2xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
              Quote Request
            </p>
            <h1 className="text-2xl font-bold mb-1">{quoteNumber}</h1>
            <p className="text-[#888] text-sm">
              {new Date(quote.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#888] text-sm mb-1">Total</p>
            <p className="text-2xl font-bold">
              {formatPrice(quote.total_price, quote.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Products ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-[#eeebe6] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eeebe6] flex items-center gap-2">
              <Package size={16} className="text-[#666]" />
              <h2 className="font-semibold text-[#111]">
                Products ({lineItems.length})
              </h2>
            </div>

            <div className="divide-y divide-[#f5f2ed]">
              {lineItems.map((item: any, index: number) => {
                const itemPrice = parseFloat(item.price);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div key={index} className="px-6 py-4 flex gap-4">
                    {/* Image */}
                    <div className="w-14 h-14 bg-[#f8f7f4] rounded-xl flex-shrink-0 overflow-hidden border border-[#eeebe6]">
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
                          <Package size={20} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111] text-sm">{item.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-[#666]">
                          Qty: {item.quantity} × {formatPrice(item.price, quote.currency)}
                        </span>
                        <span className="font-bold text-[#111] text-sm">
                          {formatPrice(String(itemTotal), quote.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-[#faf9f7] border-t border-[#eeebe6]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#666]">Subtotal</span>
                <span className="font-bold text-[#111]">
                  {formatPrice(quote.subtotal_price, quote.currency)}
                </span>
              </div>
              {quote.shipping_line && parseFloat(quote.shipping_line.price ?? '0') > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-[#666]">
                    Shipping — {quote.shipping_line.title}
                  </span>
                  <span className="text-sm text-[#333]">
                    {formatPrice(quote.shipping_line.price, quote.currency)}
                  </span>
                </div>
              )}
              {parseFloat(quote.total_tax ?? '0') > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-[#666]">Tax</span>
                  <span className="text-sm text-[#333]">
                    {formatPrice(quote.total_tax, quote.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#eeebe6]">
                <span className="font-bold text-[#111]">Total</span>
                <span className="text-lg font-bold text-[#111]">
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
            <div className="bg-white border border-[#eeebe6] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={15} className="text-[#666]" />
                <h3 className="font-semibold text-[#111] text-sm">Ship To</h3>
              </div>
              <p className="text-sm text-[#555] leading-relaxed">
                {shippingAddress.first_name} {shippingAddress.last_name}<br />
                {shippingAddress.address1}<br />
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}<br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          {/* Customer Notes */}
          {customerNotes && (
            <div className="bg-white border border-[#eeebe6] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={15} className="text-[#666]" />
                <h3 className="font-semibold text-[#111] text-sm">Your Notes</h3>
              </div>
              <p className="text-sm text-[#555] leading-relaxed">{customerNotes}</p>
            </div>
          )}

          {/* Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
              Status
            </p>
            <p className="text-sm text-amber-800 font-semibold">
              Under Review
            </p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              Our team is reviewing your quote. You'll receive an email when it's ready.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white border border-[#eeebe6] rounded-2xl p-5 text-center">
            <p className="text-sm text-[#555] mb-3">Questions about this quote?</p>
            <Link
              href="/contact"
              className="inline-block w-full py-2.5 border-2 border-[#111] text-[#111] rounded-full text-sm font-semibold hover:bg-[#111] hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}