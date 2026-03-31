'use client';

import { useCartStore } from '@/store/cart';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();
  const lines = cart?.lines.nodes ?? [];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={closeCart}
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
            <ShoppingCart size={18} className="text-brand-blue" />
            <h2 className="font-bold text-brand-navy">
              Cart ({cart?.totalQuantity ?? 0})
            </h2>
          </div>
          <button onClick={closeCart} className="p-1.5 text-brand-ink/45 transition-colors hover:text-brand-navy">
            <X size={18} />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart size={40} className="text-brand-line" />
              <p className="text-sm text-brand-ink/50">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-sm text-brand-blue hover:opacity-70"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4 border-b border-brand-line/60 pb-4 last:border-0">
                {/* Image */}
                <div className="relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl bg-brand-mist">
                  {line.merchandise.product.featuredImage ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.title}
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
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className="line-clamp-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-xs text-brand-ink/50">{line.merchandise.title}</p>
                  )}
                  <p className="text-sm font-bold text-brand-navy">
                    {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => line.quantity > 1
                        ? updateItem(line.id, line.quantity - 1)
                        : removeItem(line.id)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line"
                    >
                      {line.quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-brand-ink">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(line.id, line.quantity + 1)}
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
        {lines.length > 0 && cart && (
          <div className="flex flex-col gap-4 border-t border-brand-line bg-brand-surface px-6 py-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-ink/65">Subtotal</span>
              <span className="font-bold text-brand-navy">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <p className="-mt-2 text-[12px] text-brand-ink/50">
              Taxes and shipping calculated at checkout
            </p>
            <a
              href={cart.checkoutUrl}
              className="w-full rounded-full bg-brand-blue py-4 text-center text-sm font-bold text-white transition-colors hover:bg-brand-navy"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
