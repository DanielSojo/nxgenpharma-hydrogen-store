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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList size={24} className="text-[#111]" />
        <h1 className="text-2xl font-bold text-[#111]">My Quotes</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#2b7fff] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">
          {error}
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white border border-[#eeebe6] rounded-2xl p-16 text-center">
          <ClipboardList size={40} className="text-[#ddd] mx-auto mb-4" />
          <p className="text-[#999] font-medium mb-2">No quotes yet</p>
          <p className="text-[#bbb] text-sm mb-6">
            Browse our catalog and request a quote
          </p>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] text-white rounded-full text-sm font-semibold hover:bg-[#2a2a2a] transition-colors"
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
                className="bg-white border border-[#eeebe6] rounded-2xl px-6 py-5 flex items-center justify-between hover:border-[#2b7fff] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={18} className="text-[#666]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111]">{quoteNumber}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-[#666]">
                        {quote.lineItemsCount} item{quote.lineItemsCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-[#ddd]">•</span>
                      <span className="text-sm text-[#666] flex items-center gap-1">
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
                  <span className="text-sm font-bold text-[#111]">
                    {formatPrice(quote.totalPrice, quote.currencyCode)}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-[#ccc] group-hover:text-[#2b7fff] transition-colors"
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