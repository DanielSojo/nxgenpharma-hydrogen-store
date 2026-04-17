'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyProduct } from '@/types';
import ProductCardQuoteButton from '@/components/store/ProductCardQuoteButton';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

interface Props {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: Props) {
  const variants = product.variants.nodes;
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');
  const { formatCalculatedPrice } = useCustomerPricing();

  const variant = useMemo(
    () => variants.find((item) => item.id === selectedVariantId) ?? variants[0],
    [selectedVariantId, variants]
  );

  const activeImage = variant?.image ?? product.featuredImage;
  const hasVariantOptions =
    variants.length > 1 && variants.some((item) => item.title !== 'Default Title');
  const hasDiscount =
    variant?.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-all hover:-translate-y-1 hover:border-brand-aqua hover:shadow-lg">
      <Link href={`/products/${product.handle}`} className="flex flex-1 flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-brand-mist">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? product.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/35">
              No image
            </div>
          )}
          {!product.availableForSale && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/45">
                Sold Out
              </span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute left-3 top-3 rounded-md bg-brand-navy px-2 py-1 text-[11px] font-bold text-white">
              SALE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-4">
          {product.vendor && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
              {product.vendor}
            </p>
          )}
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-navy">
            {product.title}
          </p>
          <div className="mt-auto pt-3">
            {variant ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-brand-teal">
                  {formatCalculatedPrice(variant.price.amount, variant.price.currencyCode)}
                </span>
                {hasDiscount && variant.compareAtPrice && (
                  <span className="text-sm text-brand-ink/45 line-through">
                    {formatCalculatedPrice(
                      variant.compareAtPrice.amount,
                      variant.compareAtPrice.currencyCode
                    )}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-brand-ink/55">
                Price available upon request
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
          <div className="mb-3">
            <select
              disabled={!hasVariantOptions}
              value={variant?.id ?? ''}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="w-full rounded-xl border border-brand-line bg-brand-surface px-3 py-2.5 text-sm text-brand-ink outline-none transition-colors focus:border-brand-blue"
            >
              {variants.map((item) => {
                const label =
                  item.title !== 'Default Title'
                    ? item.title
                    : item.selectedOptions.map((option) => option.value).join(' / ') || product.title;

                return (
                  <option key={item.id} value={item.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        {variant ? (
          <ProductCardQuoteButton product={product} variant={variant} />
        ) : (
          <Link
            href={`/products/${product.handle}`}
            className="flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            View Product
          </Link>
        )}
      </div>
    </article>
  );
}