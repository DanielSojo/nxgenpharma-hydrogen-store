'use client';

import { useQuoteStore } from '@/store/quote';
import { ClipboardList, Check } from 'lucide-react';
import { useState } from 'react';
import type { ShopifyProductVariant, ShopifyProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  product: ShopifyProduct;
  selectedVariant: ShopifyProductVariant;
}

export default function AddToQuoteButton({ product, selectedVariant }: Props) {
  const { addItem } = useQuoteStore();
  const [added, setAdded] = useState(false);

  if (!selectedVariant.availableForSale) {
    return (
      <button
        disabled
        className="w-full py-4 bg-[#f8f7f4] text-[#999] rounded-full text-sm font-semibold cursor-not-allowed mt-4"
      >
        Out of Stock
      </button>
    );
  }

  const handleAdd = () => {
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: selectedVariant.title,
      productHandle: product.handle,
      image: product.featuredImage?.url ?? null,
      price: selectedVariant.price.amount,
      currencyCode: selectedVariant.price.currencyCode,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-4 rounded-full text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all mt-4 ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-[#111] hover:bg-[#2a2a2a] text-white'
      }`}
    >
      {added ? (
        <>
          <Check size={16} />
          Added to Quote
        </>
      ) : (
        <>
          <ClipboardList size={16} />
          Add to Quote
        </>
      )}
    </button>
  );
}
