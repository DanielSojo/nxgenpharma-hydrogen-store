'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import type { ShopifyProduct } from '@/types';
import ProductCardQuoteButton from '@/components/store/ProductCardQuoteButton';
import ProductPrice from '@/components/store/ProductPrice';

interface Props {
  product: ShopifyProduct;
}

export default function ProductListItem({ product }: Props) {
  const variants = product.variants.nodes;
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

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
    <article className="group border-b border-brand-line bg-white py-4 last:border-b-0">
      <div className="grid gap-4 md:grid-cols-[112px_minmax(0,1fr)_minmax(220px,260px)] md:items-center">
        <Link
          href={`/products/${product.handle}`}
          className="relative h-28 w-full overflow-hidden rounded-lg bg-brand-mist md:h-28 md:w-28"
          aria-label={`View ${product.title}`}
        >
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? product.title}
              fill
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 768px) 112px, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/35">
              No image
            </div>
          )}
          {!product.availableForSale && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/45">
                Sold Out
              </span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute left-2 top-2 rounded bg-brand-navy px-2 py-1 text-[11px] font-bold text-white">
              SALE
            </div>
          )}
        </Link>

        <div className="min-w-0">
          {product.vendor && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
              {product.vendor}
            </p>
          )}
          <Link
            href={`/products/${product.handle}`}
            className="text-base font-semibold leading-snug text-brand-navy transition-colors hover:text-brand-blue"
          >
            {product.title}
          </Link>
          {variant ? (
            <div className="mt-3">
              <ProductPrice
                amount={variant.price.amount}
                currencyCode={variant.price.currencyCode}
                compareAtAmount={variant.compareAtPrice?.amount}
                size="sm"
              />
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-brand-ink/55">
              Price available upon request
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] md:grid-cols-1">
          <select
            disabled={!hasVariantOptions}
            value={variant?.id ?? ''}
            onChange={(event) => setSelectedVariantId(event.target.value)}
            className="min-w-0 rounded-xl border border-brand-line bg-brand-surface px-3 py-2.5 text-sm text-brand-ink outline-none transition-colors focus:border-brand-blue disabled:cursor-not-allowed disabled:text-brand-ink/55"
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

          {variant ? (
            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)]">
              <div
                className={`flex h-11 items-center rounded-full border border-brand-line bg-brand-surface p-1 ${
                  !variant.availableForSale ? 'opacity-50' : ''
                }`}
                aria-label="Select quantity"
              >
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={!variant.availableForSale || quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-line disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Decrease quantity for ${product.title}`}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-brand-navy tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  disabled={!variant.availableForSale}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-line disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Increase quantity for ${product.title}`}
                >
                  <Plus size={14} />
                </button>
              </div>
              <ProductCardQuoteButton product={product} variant={variant} quantity={quantity} />
            </div>
          ) : (
            <Link
              href={`/products/${product.handle}`}
              className="flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
            >
              View Product
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
