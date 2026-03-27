'use client';

import { create } from 'zustand';
import type { ShopifyCart, CartState } from '@/types';

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  fetchCart: async (cartId: string) => {
    const res = await fetch(`/api/shopify/cart?cartId=${cartId}`);
    if (res.ok) {
      const cart: ShopifyCart = await res.json();
      set({ cart });
    }
  },

  addItem: async (variantId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const cartId = get().cart?.id ?? localStorage.getItem('cartId') ?? undefined;
      const res = await fetch('/api/shopify/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', cartId, variantId, quantity }),
      });
      const cart: ShopifyCart = await res.json();
      localStorage.setItem('cartId', cart.id);
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
