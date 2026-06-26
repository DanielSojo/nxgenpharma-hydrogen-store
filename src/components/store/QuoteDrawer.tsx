'use client';

import { useQuoteStore } from '@/store/quote';
import { X, ClipboardList, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function QuoteDrawer() {
  const { items, isOpen, closeQuote, updateQuantity, removeItem } = useQuoteStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={closeQuote}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col rounded-l-3xl bg-white shadow-[0_0_60px_-15px_rgba(23,50,82,0.45)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-tl-3xl border-b border-brand-line/70 bg-gradient-to-r from-brand-surface to-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm shadow-brand-blue/25">
              <ClipboardList size={17} />
            </span>
            <h2 className="font-bold text-brand-navy">Quote Request ({totalItems})</h2>
          </div>
          <button
            onClick={closeQuote}
            className="rounded-full p-1.5 text-brand-ink/45 transition-colors hover:bg-brand-mist hover:text-brand-navy"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
                <ClipboardList size={28} />
              </span>
              <p className="text-sm text-brand-ink/50">Your quote is empty</p>
              <button
                onClick={closeQuote}
                className="rounded-full border border-brand-line px-5 py-2 text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
              >
                Browse products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 rounded-2xl border border-brand-line/60 bg-white p-3 shadow-[0_1px_8px_-4px_rgba(23,50,82,0.12)] transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <div className="bg-catalog-hero relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      width={72}
                      height={72}
                      className="h-full w-full object-contain p-1.5 [filter:drop-shadow(0_6px_8px_rgba(0,0,0,0.55))]"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productHandle}`}
                    onClick={closeQuote}
                    className="line-clamp-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
                  >
                    {item.productTitle}
                  </Link>
                  {item.variantTitle !== 'Default Title' && (
                    <p className="text-xs text-brand-ink/50">{item.variantTitle}</p>
                  )}
                  <p className="text-sm text-brand-ink/65">
                    Qty: {item.quantity}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.variantId, item.quantity - 1)
                          : removeItem(item.variantId)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={12} />
                      ) : (
                        <Minus size={12} />
                      )}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-brand-ink tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-brand-line/70 bg-brand-surface px-6 py-5">
            <div className="flex items-center justify-between text-sm text-brand-ink/65">
              <span>Total items</span>
              <span className="text-lg font-bold text-brand-navy">{totalItems}</span>
            </div>
            <p className="text-[12px] text-brand-ink/50">
              Pricing will be confirmed after quote review
            </p>
            <Link
              href="/quote"
              onClick={closeQuote}
              className="group bg-brand-gradient flex w-full items-center justify-center gap-2 rounded-full py-4 text-center text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Request Quote <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
