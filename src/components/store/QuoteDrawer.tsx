'use client';

import { useQuoteStore } from '@/store/quote';
import { X, ClipboardList, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

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
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-line px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-brand-blue" />
            <h2 className="font-bold text-brand-navy">Quote Request ({totalItems})</h2>
          </div>
          <button
            onClick={closeQuote}
            className="p-1.5 text-brand-ink/45 transition-colors hover:text-brand-navy"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ClipboardList size={40} className="text-brand-line" />
              <p className="text-sm text-brand-ink/50">Your quote is empty</p>
              <button
                onClick={closeQuote}
                className="text-sm text-brand-blue hover:opacity-70"
              >
                Browse products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 border-b border-brand-line/60 pb-4 last:border-0"
              >
                {/* Image */}
                <div className="relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl bg-brand-mist">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      width={72}
                      height={72}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-brand-mist" />
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
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={11} />
                      ) : (
                        <Minus size={11} />
                      )}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-brand-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-brand-line bg-brand-surface px-6 py-5">
            <div className="flex items-center justify-between text-sm text-brand-ink/65">
              <span>Total items</span>
              <span className="font-bold text-brand-navy">{totalItems}</span>
            </div>
            <p className="text-[12px] text-brand-ink/50">
              Pricing will be confirmed after quote review
            </p>
            <Link
              href="/quote"
              onClick={closeQuote}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-4 text-center text-sm font-bold text-white transition-colors hover:bg-brand-navy"
            >
              Request Quote <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
