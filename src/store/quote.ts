'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuoteItem, QuoteState } from '@/types';

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openQuote: () => set({ isOpen: true }),
      closeQuote: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      addItem: (newItem, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        const quantityToAdd = Math.max(1, quantity);
        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + quantityToAdd }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: quantityToAdd }], isOpen: true });
        }
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      clearQuote: () => set({ items: [] }),
    }),
    { name: 'NexGen-quote' }
  )
);
