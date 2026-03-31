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
        className="mt-4 w-full cursor-not-allowed rounded-full bg-brand-mist py-4 text-sm font-semibold text-brand-ink/50"
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
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold tracking-wide transition-all ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-brand-navy text-white hover:bg-brand-blue'
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
