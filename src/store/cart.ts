'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import type { ShopifyCart, CartState } from '@/types';
import { CART_ID_KEY, clearPendingCheckout, savePendingCheckout } from '@/lib/checkout';

/** Marks a key (variant id or line id) as in-flight, or clears it. */
function setPending(
  pending: Record<string, boolean>,
  key: string,
  value: boolean
): Record<string, boolean> {
  if (!value) {
    const { [key]: _removed, ...rest } = pending;
    return rest;
  }
  return { ...pending, [key]: true };
}

/**
 * Posts to the cart API and returns the cart, or throws with a message worth
 * showing. The route answers 200 with an empty body when Shopify rejects the
 * cart id (a completed or expired cart), so an absent `id` counts as a failure.
 */
async function postCart(body: Record<string, unknown>): Promise<ShopifyCart> {
  const res = await fetch('/api/shopify/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error ?? 'Could not update your cart. Please try again.');
  }
  if (!json?.id) {
    throw new Error('STALE_CART');
  }

  return json as ShopifyCart;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  pending: {},

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

  /**
   * Adds a line and confirms with a toast rather than throwing the drawer open.
   * Buyers working down the quick-order catalog add many items in a row; the
   * drawer interrupted that every single time.
   */
  addItem: async (variantId: string, quantity: number, options = {}) => {
    set((state) => ({ pending: setPending(state.pending, variantId, true) }));

    try {
      const cartId = get().cart?.id ?? localStorage.getItem(CART_ID_KEY) ?? undefined;

      let cart: ShopifyCart;
      try {
        cart = await postCart({ action: 'add', cartId, variantId, quantity });
      } catch (error) {
        // A cart that Shopify no longer accepts used to leave the buyer clicking
        // a dead button. Drop the stale id and start a fresh cart once.
        if (cartId && error instanceof Error && error.message === 'STALE_CART') {
          localStorage.removeItem(CART_ID_KEY);
          set({ cart: null });
          cart = await postCart({ action: 'add', variantId, quantity });
        } else {
          throw error;
        }
      }

      localStorage.setItem(CART_ID_KEY, cart.id);
      set({ cart });

      // Bulk callers (reorder) report once for the whole batch instead.
      if (!options.silent) {
        toast.success(options.label ? `${options.label} added to cart` : 'Added to cart', {
          description: `Quantity: ${quantity}`,
          action: { label: 'View cart', onClick: () => set({ isOpen: true }) },
        });
      }

      return true;
    } catch (error) {
      if (options.silent) return false;
      const message =
        error instanceof Error && error.message !== 'STALE_CART'
          ? error.message
          : 'Could not add this item to your cart. Please try again.';
      toast.error(message);
      return false;
    } finally {
      set((state) => ({ pending: setPending(state.pending, variantId, false) }));
    }
  },

  removeItem: async (lineId: string) => {
    const cartId = get().cart?.id;
    if (!cartId) return;

    set((state) => ({ pending: setPending(state.pending, lineId, true) }));
    try {
      const cart = await postCart({ action: 'remove', cartId, lineId });
      set({ cart });
    } catch {
      toast.error('Could not remove that item. Please try again.');
    } finally {
      set((state) => ({ pending: setPending(state.pending, lineId, false) }));
    }
  },

  updateItem: async (lineId: string, quantity: number) => {
    const cartId = get().cart?.id;
    if (!cartId) return;

    set((state) => ({ pending: setPending(state.pending, lineId, true) }));
    try {
      const cart = await postCart({ action: 'update', cartId, lineId, quantity });
      set({ cart });
    } catch {
      toast.error('Could not update that quantity. Please try again.');
    } finally {
      set((state) => ({ pending: setPending(state.pending, lineId, false) }));
    }
  },
}));
