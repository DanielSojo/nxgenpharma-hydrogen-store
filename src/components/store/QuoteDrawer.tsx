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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeebe6]">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#333]" />
            <h2 className="font-bold text-[#111]">Quote Request ({totalItems})</h2>
          </div>
          <button
            onClick={closeQuote}
            className="p-1.5 text-[#999] hover:text-[#333] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ClipboardList size={40} className="text-[#ddd]" />
              <p className="text-[#999] text-sm">Your quote is empty</p>
              <button
                onClick={closeQuote}
                className="text-[#2b7fff] text-sm hover:opacity-70"
              >
                Browse products
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 pb-4 border-b border-[#f5f2ed] last:border-0"
              >
                {/* Image */}
                <div className="relative w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden bg-[#f8f7f4]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      width={72}
                      height={72}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f0ece4]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productHandle}`}
                    onClick={closeQuote}
                    className="text-sm font-semibold text-[#111] hover:text-[#2b7fff] transition-colors line-clamp-2"
                  >
                    {item.productTitle}
                  </Link>
                  {item.variantTitle !== 'Default Title' && (
                    <p className="text-xs text-[#999]">{item.variantTitle}</p>
                  )}
                  <p className="text-sm text-[#666]">
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
                      className="w-6 h-6 rounded-md bg-[#f8f7f4] flex items-center justify-center text-[#555] hover:bg-[#eeebe6] transition-colors"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={11} />
                      ) : (
                        <Minus size={11} />
                      )}
                    </button>
                    <span className="text-sm font-semibold text-[#333] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#f8f7f4] flex items-center justify-center text-[#555] hover:bg-[#eeebe6] transition-colors"
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
          <div className="px-6 py-5 border-t border-[#eeebe6] flex flex-col gap-3 bg-[#faf9f7]">
            <div className="flex justify-between items-center text-sm text-[#666]">
              <span>Total items</span>
              <span className="font-bold text-[#111]">{totalItems}</span>
            </div>
            <p className="text-[12px] text-[#999]">
              Pricing will be confirmed after quote review
            </p>
            <Link
              href="/quote"
              onClick={closeQuote}
              className="w-full py-4 bg-[#2b7fff] hover:bg-[#1a6fee] text-white rounded-full text-sm font-bold text-center transition-colors flex items-center justify-center gap-2"
            >
              Request Quote <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}