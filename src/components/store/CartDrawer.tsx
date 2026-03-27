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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeebe6]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#333]" />
            <h2 className="font-bold text-[#111]">
              Cart ({cart?.totalQuantity ?? 0})
            </h2>
          </div>
          <button onClick={closeCart} className="p-1.5 text-[#999] hover:text-[#333] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart size={40} className="text-[#ddd]" />
              <p className="text-[#999] text-sm">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-[#2b7fff] text-sm hover:opacity-70"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="flex gap-4 pb-4 border-b border-[#f5f2ed] last:border-0">
                {/* Image */}
                <div className="relative w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden bg-[#f8f7f4]">
                  {line.merchandise.product.featuredImage ? (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={line.merchandise.product.title}
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
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className="text-sm font-semibold text-[#111] hover:text-[#2b7fff] transition-colors line-clamp-2"
                  >
                    {line.merchandise.product.title}
                  </Link>
                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-xs text-[#999]">{line.merchandise.title}</p>
                  )}
                  <p className="text-sm font-bold text-[#111]">
                    {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => line.quantity > 1
                        ? updateItem(line.id, line.quantity - 1)
                        : removeItem(line.id)
                      }
                      className="w-6 h-6 rounded-md bg-[#f8f7f4] flex items-center justify-center text-[#555] hover:bg-[#eeebe6] transition-colors"
                    >
                      {line.quantity === 1 ? <Trash2 size={11} /> : <Minus size={11} />}
                    </button>
                    <span className="text-sm font-semibold text-[#333] w-5 text-center">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(line.id, line.quantity + 1)}
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
        {lines.length > 0 && cart && (
          <div className="px-6 py-5 border-t border-[#eeebe6] flex flex-col gap-4 bg-[#faf9f7]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#666]">Subtotal</span>
              <span className="font-bold text-[#111]">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <p className="text-[12px] text-[#999] -mt-2">
              Taxes and shipping calculated at checkout
            </p>
            <a
              href={cart.checkoutUrl}
              className="w-full py-4 bg-[#2b7fff] hover:bg-[#1a6fee] text-white rounded-full text-sm font-bold text-center transition-colors"
            >
              Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
