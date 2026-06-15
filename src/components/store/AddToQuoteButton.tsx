'use client';

import { useQuoteStore } from '@/store/quote';
import { ClipboardList, Check } from 'lucide-react';
import { useState } from 'react';
import type { ShopifyProductVariant, ShopifyProduct } from '@/types';

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
        className="mt-4 w-full cursor-not-allowed rounded-full border border-brand-line bg-brand-mist py-4 text-sm font-semibold text-brand-ink/50"
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
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
        added
          ? 'bg-green-600 shadow-green-600/25'
          : 'bg-brand-gradient-navy shadow-brand-navy/25 hover:shadow-xl'
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
