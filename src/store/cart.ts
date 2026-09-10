'use client';

import { create } from 'zustand';
import type { ShopifyCart, CartState } from '@/types';
import { CART_ID_KEY, clearPendingCheckout, savePendingCheckout } from '@/lib/checkout';

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  clearCart: () => {
    localStorage.removeItem(CART_ID_KEY);
    clearPendingCheckout();
    set({ cart: null, isOpen: false });
  },

  fetchCart: async (cartId: string) => {
    const res = await fetch(`/api/shopify/cart?cartId=${encodeURIComponent(cartId)}`);
    if (res.ok) {
      const cart: ShopifyCart = await res.json();
      set({ cart });
      return;
    }

    // A stale id (completed or expired cart) would otherwise wedge the drawer.
    if (res.status === 404) {
      localStorage.removeItem(CART_ID_KEY);
      set({ cart: null });
    }
  },

  // Restores the cart on a fresh page load — including the return trip from
  // Shopify's checkout, where the app is booting from scratch.
  hydrate: async () => {
    if (get().cart) return;
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    await get().fetchCart(cartId);
  },

  startCheckout: async () => {
    const cartId = get().cart?.id ?? localStorage.getItem(CART_ID_KEY);
    if (!cartId) throw new Error('Your cart is empty');

    set({ isLoading: true });
    try {
      const res = await fetch('/api/shopify/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Could not start checkout');

      // Remember the in-flight checkout so the success page can reconcile it
      // even if the buyer comes back without the ref in the URL.
      savePendingCheckout({
        ref: json.ref,
        cartId,
        startedAt: new Date().toISOString(),
      });

      return { checkoutUrl: json.checkoutUrl as string, ref: json.ref as string };
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const cartId = get().cart?.id ?? localStorage.getItem(CART_ID_KEY) ?? undefined;
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', cartId, variantId, quantity }),
      });
      const cart: ShopifyCart = await res.json();
      localStorage.setItem(CART_ID_KEY, cart.id);
      set({ cart, isOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (lineId: string) => {
    set({ isLoading: true });
    try {
      const cartId = get().cart?.id;
      if (!cartId) return;
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', cartId, lineId }),
      });
      const cart: ShopifyCart = await res.json();
      set({ cart });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (lineId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const cartId = get().cart?.id;
      if (!cartId) return;
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', cartId, lineId, quantity }),
      });
      const cart: ShopifyCart = await res.json();
      set({ cart });
    } finally {
      set({ isLoading: false });
    }
  },
}));
