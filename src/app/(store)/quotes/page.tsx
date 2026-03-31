'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ArrowRight, Clock, ChevronRight } from 'lucide-react';

interface Quote {
  id: number;
  name: string;
  status: string;
  totalPrice: string;
  currencyCode: string;
  createdAt: string;
  lineItemsCount: number;
  note: string;
}

function formatPrice(amount: string, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(parseFloat(amount));
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/quotes')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setQuotes(data.quotes ?? []);
      })
      .catch(() => setError('Failed to load quotes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-8 text-white">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-brand-aqua" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-aqua">Account</p>
            <h1 className="mt-2 text-2xl font-bold">My Quotes</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72">
          Review submitted quote requests, check totals, and open each quote for line-item details.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
          {error}
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-brand-line bg-white p-16 text-center">
          <ClipboardList size={40} className="mx-auto mb-4 text-brand-line" />
          <p className="mb-2 font-medium text-brand-ink/60">No quotes yet</p>
          <p className="mb-6 text-sm text-brand-ink/40">
            Browse our catalog and request a quote
          </p>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue"
          >
            Browse Catalog <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => {
            // Extract quote number from note
            const quoteNumberMatch = quote.note?.match(/Quote Number: (Q\S+)/);
            const quoteNumber = quoteNumberMatch?.[1] ?? quote.name;

            return (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="group flex items-center justify-between rounded-2xl border border-brand-line bg-white px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                    <ClipboardList size={18} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{quoteNumber}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-brand-ink/65">
                        {quote.lineItemsCount} item{quote.lineItemsCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-brand-line">•</span>
                      <span className="flex items-center gap-1 text-sm text-brand-ink/65">
                        <Clock size={12} />
                        {new Date(quote.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-brand-navy">
                    {formatPrice(quote.totalPrice, quote.currencyCode)}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-brand-ink/30 transition-colors group-hover:text-brand-blue"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
