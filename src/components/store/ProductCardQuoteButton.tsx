'use client';

import { useState } from 'react';
import { Check, ClipboardList } from 'lucide-react';
import { useQuoteStore } from '@/store/quote';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types';

interface Props {
  product: ShopifyProduct;
  variant: ShopifyProductVariant;
}

export default function ProductCardQuoteButton({ product, variant }: Props) {
  const { addItem } = useQuoteStore();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (!variant.availableForSale) return;

    addItem({
      variantId: variant.id,
      productId: product.id,
      productTitle: product.title,
      variantTitle: variant.title,
      productHandle: product.handle,
      image: product.featuredImage?.url ?? null,
      price: variant.price.amount,
      currencyCode: variant.price.currencyCode,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!variant.availableForSale}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
        !variant.availableForSale
          ? 'cursor-not-allowed bg-brand-mist text-brand-ink/45'
          : added
            ? 'bg-green-600 text-white'
            : 'bg-brand-navy text-white hover:bg-brand-blue'
      }`}
    >
      {variant.availableForSale ? (
        added ? (
          <>
            <Check size={16} />
            Added to Quote
          </>
        ) : (
          <>
            <ClipboardList size={16} />
            Request Quote
          </>
        )
      ) : (
        'Unavailable'
      )}
    </button>
  );
}
