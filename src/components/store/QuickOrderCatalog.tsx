'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, Loader2, Minus, Plus, Search, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types';
import { useCartStore } from '@/store/cart';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

interface CollectionOption {
  id: string;
  handle: string;
  title: string;
}

interface Props {
  products: ShopifyProduct[];
  collections: CollectionOption[];
  activeHandle: string;
  title?: string;
  eyebrow?: string;
  description?: string;
}

type StockFilter = 'all' | 'in-stock' | 'out-of-stock';
type SortOption = 'alpha-az' | 'alpha-za' | 'price-low' | 'price-high';

function variantLabel(product: ShopifyProduct, variant: ShopifyProductVariant) {
  if (variant.title && variant.title !== 'Default Title') return variant.title;

  const selectedLabel = variant.selectedOptions
    .map((option) => option.value)
    .filter(Boolean)
    .join(' - ');

  return selectedLabel || product.title;
}

function getVariantSearchText(product: ShopifyProduct, variant: ShopifyProductVariant) {
  return [
    variant.title,
    ...variant.selectedOptions.flatMap((option) => [option.name, option.value]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getVariantPrice(variant?: ShopifyProductVariant) {
  return Number.parseFloat(variant?.price.amount ?? '0') || 0;
}

function productMinPrice(product: ShopifyProduct) {
  const variantPrices = product.variants.nodes.map(getVariantPrice).filter((price) => price > 0);
  return variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
}

function getVialValues(products: ShopifyProduct[]) {
  const values = new Set<string>();

  products.forEach((product) => {
    product.variants.nodes.forEach((variant) => {
      variant.selectedOptions.forEach((option) => {
        const optionText = `${option.name} ${option.value}`.toLowerCase();
        if (/(vial|size|volume|ml|mg)/i.test(optionText)) {
          values.add(option.value);
        }
      });

      if (variant.title && variant.title !== 'Default Title') {
        values.add(variant.title);
      }
    });
  });

  return Array.from(values).sort((first, second) =>
    first.localeCompare(second, undefined, { numeric: true, sensitivity: 'base' })
  );
}

function getPreferredVariant(
  product: ShopifyProduct,
  selectedVariantId: string,
  vialFilter: string
) {
  const variants = product.variants.nodes;
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);

  if (vialFilter === 'all') return selectedVariant ?? variants[0];

  return (
    variants.find((variant) => getVariantSearchText(product, variant).includes(vialFilter.toLowerCase())) ??
    selectedVariant ??
    variants[0]
  );
}

function QuickOrderRow({ product, vialFilter }: { product: ShopifyProduct; vialFilter: string }) {
  const variants = product.variants.nodes;
  const { addItem, isLoading } = useCartStore();
  const { formatCalculatedPrice } = useCustomerPricing();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(
    () => getPreferredVariant(product, selectedVariantId, vialFilter),
    [product, selectedVariantId, vialFilter]
  );

  const activeImage = variant?.image ?? product.featuredImage;
  const hasVariantOptions =
    variants.length > 1 && variants.some((item) => item.title !== 'Default Title');
  const available = Boolean(variant?.availableForSale);
  const compareAtPrice = Number.parseFloat(variant?.compareAtPrice?.amount ?? '0');
  const currentPrice = Number.parseFloat(variant?.price.amount ?? '0');
  const discountPercent =
    compareAtPrice > currentPrice && currentPrice > 0
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : null;

  return (
    <article className="group rounded-2xl border border-brand-line/70 bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_16px_36px_-16px_rgba(23,50,82,0.28)] sm:px-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.35fr)_minmax(180px,0.85fr)_minmax(360px,1.35fr)] lg:items-center">
        <div className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] items-center gap-4">
          <Link
            href={`/products/${product.handle}`}
            className="relative h-20 w-20 overflow-hidden rounded-xl bg-brand-surface ring-1 ring-brand-line/60 transition-transform duration-200 group-hover:scale-[1.03] sm:h-24 sm:w-24"
            aria-label={`View ${product.title}`}
          >
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.altText ?? product.title}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/35">
                No image
              </span>
            )}
          </Link>

          <Link
            href={`/products/${product.handle}`}
            className="min-w-0 text-base font-semibold leading-snug text-brand-ink transition-colors hover:text-brand-blue"
          >
            {product.title}
          </Link>
        </div>

        <div>
          {variant ? (
            <>
              <p className="text-xl font-semibold text-brand-ink">
                {formatCalculatedPrice(variant.price.amount, variant.price.currencyCode)}
              </p>
              <span
                className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  available
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-600/15'
                    : 'bg-red-50 text-red-600 ring-1 ring-red-500/15'
                }`}
              >
                {available ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {available ? 'In stock' : 'Out of Stock'}
              </span>
              {discountPercent ? (
                <p className="mt-1 text-sm font-medium text-brand-ink/65">
                  Was{' '}
                  {formatCalculatedPrice(
                    variant.compareAtPrice!.amount,
                    variant.compareAtPrice!.currencyCode
                  )}{' '}
                  <span className="text-green-600">(Save {discountPercent}%)</span>
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm font-medium text-brand-ink/55">Price available upon request</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
          <label className="relative block">
            <span className="sr-only">Select vial for {product.title}</span>
            <select
              disabled={!hasVariantOptions}
              value={variant?.id ?? ''}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-brand-line/70 bg-brand-surface px-4 pr-10 text-sm font-semibold text-brand-ink outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:text-brand-ink/50"
            >
              {variants.map((item) => (
                <option key={item.id} value={item.id}>
                  {variantLabel(product, item)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/70"
              size={16}
            />
          </label>

          {available ? (
            <div className="grid h-12 grid-cols-[44px_1fr_44px] items-center rounded-full border border-brand-line/70 bg-brand-surface text-brand-ink">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                className="flex h-12 items-center justify-center rounded-l-full font-semibold transition-colors hover:bg-brand-line/60 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Decrease quantity for ${product.title}`}
              >
                <Minus size={16} />
              </button>
              <span className="text-center text-sm font-semibold tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="flex h-12 items-center justify-center rounded-r-full font-semibold transition-colors hover:bg-brand-line/60 hover:text-brand-blue"
                aria-label={`Increase quantity for ${product.title}`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <div className="flex h-12 items-center justify-center rounded-full border border-brand-line/70 bg-brand-surface px-4 text-center text-sm font-semibold text-brand-ink/75">
              Restocking soon
            </div>
          )}

          <button
            type="button"
            onClick={() => variant && addItem(variant.id, quantity)}
            disabled={!available || isLoading}
            className="bg-brand-gradient flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-brand-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-blue/30 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
          >
            {isLoading && available ? (
              <Loader2 className="animate-spin" size={17} />
            ) : available ? (
              'Add to Cart'
            ) : (
              'Notify Me'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function QuickOrderCatalog({
  products,
  collections,
  activeHandle,
  title = 'Quick Order',
  eyebrow,
  description,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [vialFilter, setVialFilter] = useState('all');
  const [sort, setSort] = useState<SortOption>('alpha-az');

  const vialOptions = useMemo(() => getVialValues(products), [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedVial = vialFilter.toLowerCase();

    return products
      .filter((product) => {
        const productText = [
          product.title,
          product.vendor,
          product.description,
          ...(product.tags ?? []),
          ...product.variants.nodes.map((variant) => variantLabel(product, variant)),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (normalizedSearch && !productText.includes(normalizedSearch)) return false;
        if (stockFilter === 'in-stock' && !product.availableForSale) return false;
        if (stockFilter === 'out-of-stock' && product.availableForSale) return false;
        if (
          vialFilter !== 'all' &&
          !product.variants.nodes.some((variant) =>
            getVariantSearchText(product, variant).includes(normalizedVial)
          )
        ) {
          return false;
        }

        return true;
      })
      .sort((first, second) => {
        if (sort === 'alpha-za') return second.title.localeCompare(first.title);
        if (sort === 'price-low') return productMinPrice(first) - productMinPrice(second);
        if (sort === 'price-high') return productMinPrice(second) - productMinPrice(first);
        return first.title.localeCompare(second.title);
      });
  }, [products, search, stockFilter, vialFilter, sort]);

  return (
    <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-ink/62">{description}</p>
          ) : null}
        </div>

        <label className="relative w-full lg:mt-1 lg:max-w-sm">
          <span className="sr-only">Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="h-12 w-full rounded-xl border border-brand-line bg-white px-4 pr-11 text-base text-brand-ink outline-none transition-all placeholder:text-brand-ink/40 hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
          />
          <Search
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/55"
            size={20}
          />
        </label>
      </div>

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-base font-semibold text-brand-ink">Filter:</span>

          <label className="relative">
            <span className="sr-only">Stock availability</span>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
              className="h-11 appearance-none rounded-full border border-brand-line bg-white pl-4 pr-10 text-sm font-semibold text-brand-ink/80 outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
            >
              <option value="all">Stock availability</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-blue"
              size={16}
            />
          </label>

          <label className="relative">
            <span className="sr-only">Vial</span>
            <select
              value={vialFilter}
              onChange={(event) => setVialFilter(event.target.value)}
              className="h-11 appearance-none rounded-full border border-brand-line bg-white pl-4 pr-10 text-sm font-semibold text-brand-ink/80 outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
            >
              <option value="all">Vial</option>
              {vialOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-blue"
              size={16}
            />
          </label>

          {collections.length > 0 ? (
            <label className="relative">
              <span className="sr-only">Collection</span>
              <select
                value={activeHandle}
                onChange={(event) => {
                  const nextHandle = event.target.value;
                  router.push(nextHandle === 'all' ? '/collections/all' : `/collections/${nextHandle}`);
                }}
                className="h-11 appearance-none rounded-full border border-brand-line bg-white pl-4 pr-10 text-sm font-semibold text-brand-ink/80 outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
              >
                <option value="all">All products</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.handle}>
                    {collection.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-blue"
                size={16}
              />
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          <span className="text-base font-semibold text-brand-ink">Sort by:</span>
          <label className="relative">
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-11 appearance-none rounded-full border border-brand-line bg-white pl-5 pr-11 text-sm font-semibold text-brand-ink/80 outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
            >
              <option value="alpha-az">Alphabetically, A-Z</option>
              <option value="alpha-za">Alphabetically, Z-A</option>
              <option value="price-low">Price, low to high</option>
              <option value="price-high">Price, high to low</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue"
              size={18}
            />
          </label>
          <span className="text-base font-semibold text-brand-ink/50">
            {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="space-y-4">
          {visibleProducts.map((product) => (
            <QuickOrderRow key={product.id} product={product} vialFilter={vialFilter} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-line/70 bg-white px-6 py-20 text-center shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
            <Search size={24} />
          </div>
          <p className="text-lg font-semibold text-brand-navy">No products found</p>
          <p className="mt-2 text-sm text-brand-ink/55">Adjust the filters or search terms to keep browsing.</p>
        </div>
      )}
    </div>
  );
}
