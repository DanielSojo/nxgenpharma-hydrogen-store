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
      <button disabled className="mt-4 w-full cursor-not-allowed rounded-full border border-brand-line bg-brand-mist py-4 text-sm font-semibold text-brand-ink/50">
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(variantId, 1)}
      disabled={isLoading}
      className="bg-brand-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
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
