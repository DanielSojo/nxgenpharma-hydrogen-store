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
      <button disabled className="w-full py-4 bg-[#f8f7f4] text-[#999] rounded-full text-sm font-semibold cursor-not-allowed mt-4">
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem(variantId, 1)}
      disabled={isLoading}
      className="w-full py-4 bg-[#111] hover:bg-[#2a2a2a] disabled:opacity-60 text-white rounded-full text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-colors mt-4"
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
