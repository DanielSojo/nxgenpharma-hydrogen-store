'use client';

import { useCartStore } from '@/store/cart';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface Props {
  variantId: string;
  available: boolean;
}

export default function AddToCartButton({ variantId, available }: Props) {
  const { addItem, isLoading } = useCartStore();

  if (!available) {
    return (
      <button disabled className="mt-4 w-full cursor-not-allowed rounded-full bg-brand-mist py-4 text-sm font-semibold text-brand-ink/50">
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(variantId, 1)}
      disabled={isLoading}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-4 text-sm font-bold tracking-wide text-white transition-colors hover:bg-brand-blue disabled:opacity-60"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ShoppingCart size={16} />
      )}
      Add to Cart
    </button>
  );
}
