'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';
import PageHeader from '@/components/layout/PageHeader';

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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatCalculatedPrice } = useCustomerPricing();

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
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <PageHeader
        eyebrow="Quotes"
        title="My Quotes"
        icon={ClipboardList}
        description="Track your quote requests, review pricing, and continue toward placing an order."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>
      ) : quotes.length === 0 ? (
        <div className="rounded-2xl border border-brand-line/70 bg-white p-16 text-center shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)]">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
            <ClipboardList size={30} />
          </span>
          <p className="mb-2 font-semibold text-brand-navy">No quotes yet</p>
          <p className="mb-6 text-sm text-brand-ink/55">Browse our catalog and request a quote</p>
          <Link
            href="/collections/all"
            className="bg-brand-gradient-navy inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Browse Catalog <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => {
            const quoteNumberMatch = quote.note?.match(/Quote Number: (Q\S+)/);
            const quoteNumber = quoteNumberMatch?.[1] ?? quote.name;

            return (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="group flex items-center justify-between rounded-2xl border border-brand-line/70 bg-white px-6 py-5 shadow-[0_1px_8px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_16px_36px_-18px_rgba(23,50,82,0.28)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist text-brand-blue transition-transform duration-200 group-hover:scale-105">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{quoteNumber}</p>
                    <div className="mt-0.5 flex items-center gap-3">
                      <span className="text-sm text-brand-ink/60">
                        {quote.lineItemsCount} item{quote.lineItemsCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-brand-line">•</span>
                      <span className="flex items-center gap-1 text-sm text-brand-ink/60">
                        <Clock size={12} />
                        {new Date(quote.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-brand-navy">
                    {formatCalculatedPrice(quote.totalPrice, quote.currencyCode)}
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