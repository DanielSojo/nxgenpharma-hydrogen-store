'use client';

import { useCartStore } from '@/store/cart';
import { X, ShoppingCart, Plus, Minus, Trash2, BadgePercent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCartStore();
  const { formatCalculatedPrice } = useCustomerPricing();
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
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col rounded-l-3xl bg-white shadow-[0_0_60px_-15px_rgba(23,50,82,0.45)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-tl-3xl border-b border-brand-line/70 bg-gradient-to-r from-brand-surface to-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm shadow-brand-blue/25">
              <ShoppingCart size={17} />
            </span>
            <h2 className="font-bold text-brand-navy">
              Cart ({cart?.totalQuantity ?? 0})
            </h2>
          </div>
          <button onClick={closeCart} className="rounded-full p-1.5 text-brand-ink/45 transition-colors hover:bg-brand-mist hover:text-brand-navy">
            <X size={18} />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
                <ShoppingCart size={28} />
              </span>
              <p className="text-sm text-brand-ink/50">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="rounded-full border border-brand-line px-5 py-2 text-sm font-semibold text-brand-navy transition-all hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4 rounded-2xl border border-brand-line/60 bg-white p-3 shadow-[0_1px_8px_-4px_rgba(23,50,82,0.12)] transition-shadow hover:shadow-md">
                {/* Image */}
                <div className="bg-catalog-hero relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
                  {line.merchandise.product.featuredImage ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.title}
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
                    {formatCalculatedPrice(
                      line.cost.totalAmount.amount,
                      line.cost.totalAmount.currencyCode
                    )}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => line.quantity > 1
                        ? updateItem(line.id, line.quantity - 1)
                        : removeItem(line.id)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue"
                    >
                      {line.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-brand-ink tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(line.id, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue"
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
          <div className="flex flex-col gap-4 border-t border-brand-line/70 bg-brand-surface px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-ink/65">Subtotal</span>
              <span className="text-lg font-bold text-brand-navy">
                {formatCalculatedPrice(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode
                )}
              </span>
            </div>
            <p className="-mt-2 text-[12px] text-brand-ink/50">
              Taxes and shipping calculated at checkout
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <BadgePercent size={15} className="flex-shrink-0 text-emerald-600" />
              <p className="text-[12px] leading-snug text-emerald-800">
                <span className="font-semibold">Pay with Zelle and save 3%</span> &mdash; select Zelle at checkout or mention it when confirming your order.
              </p>
            </div>
            <a
              href={cart.checkoutUrl}
              className="bg-brand-gradient w-full rounded-full py-4 text-center text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
