'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Boxes,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Minus,
  Plus,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types';
import { useCartStore } from '@/store/cart';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';
import PageHeader from '@/components/layout/PageHeader';
import CatalogLoading from '@/components/feedback/CatalogLoading';

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
type ViewOption = 'grid' | 'list';

const STOCK_FILTERS: StockFilter[] = ['all', 'in-stock', 'out-of-stock'];
const SORT_OPTIONS: SortOption[] = ['alpha-az', 'alpha-za', 'price-low', 'price-high'];

/** Largest quantity a single add-to-cart click may submit. */
const MAX_QUANTITY = 9999;

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

/**
 * Quantity that can be typed as well as stepped. Wholesale buyers order in
 * dozens — reaching 50 with the +/- buttons alone took 49 clicks.
 *
 * The raw string is kept alongside the number so the field can be briefly empty
 * while the buyer retypes it, without snapping back to 1 mid-keystroke.
 */
function useQuantity() {
  const [quantity, setQuantity] = useState(1);
  const [draft, setDraft] = useState('1');

  const commit = useCallback((next: number) => {
    const clamped = Math.min(MAX_QUANTITY, Math.max(1, Math.round(next) || 1));
    setQuantity(clamped);
    setDraft(String(clamped));
  }, []);

  const onChange = useCallback((raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '');
    setDraft(digitsOnly);
    const parsed = Number.parseInt(digitsOnly, 10);
    if (Number.isFinite(parsed) && parsed >= 1) {
      setQuantity(Math.min(MAX_QUANTITY, parsed));
    }
  }, []);

  // An empty or zero field on blur falls back to 1 rather than blocking the add.
  const onBlur = useCallback(() => commit(quantity), [commit, quantity]);

  return { quantity, draft, commit, onChange, onBlur, reset: () => commit(1) };
}

function useProductOrder(product: ShopifyProduct, vialFilter: string) {
  const variants = product.variants.nodes;
  const addItem = useCartStore((state) => state.addItem);
  const pending = useCartStore((state) => state.pending);
  const { formatCalculatedPrice } = useCustomerPricing();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? '');
  const quantityControl = useQuantity();

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

  // Only this row spins — `pending` is keyed by variant id, so adding one
  // product no longer puts every other button in the catalog into a loader.
  const isAdding = Boolean(variant && pending[variant.id]);

  const handleAdd = useCallback(async () => {
    if (!variant) return;
    const added = await addItem(variant.id, quantityControl.quantity, { label: product.title });
    // Reset so the next product starts at 1 instead of inheriting a bulk count.
    if (added) quantityControl.reset();
  }, [addItem, product.title, quantityControl, variant]);

  return {
    variants,
    variant,
    activeImage,
    hasVariantOptions,
    available,
    discountPercent,
    quantityControl,
    setSelectedVariantId,
    handleAdd,
    isAdding,
    formatCalculatedPrice,
  };
}

/** Shared stepper: minus, a typable field, plus. */
function QuantityStepper({
  control,
  label,
  size = 'lg',
  disabled = false,
}: {
  control: ReturnType<typeof useQuantity>;
  label: string;
  size?: 'lg' | 'sm';
  disabled?: boolean;
}) {
  const isLarge = size === 'lg';

  return (
    <div
      className={`grid items-center rounded-full border border-brand-line/70 bg-brand-surface text-brand-ink ${
        isLarge
          ? 'h-12 grid-cols-[44px_1fr_44px]'
          : 'h-10 w-[104px] shrink-0 grid-cols-[34px_1fr_34px]'
      }`}
    >
      <button
        type="button"
        onClick={() => control.commit(control.quantity - 1)}
        disabled={disabled || control.quantity <= 1}
        className={`flex items-center justify-center rounded-l-full font-semibold transition-colors hover:bg-brand-line/60 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-35 ${
          isLarge ? 'h-12' : 'h-10'
        }`}
        aria-label={`Decrease quantity for ${label}`}
      >
        <Minus size={isLarge ? 16 : 14} />
      </button>

      {/*
        `size={1}` matters: a bare text input reports a 20-character intrinsic
        width, and that is what the grid track sizes against — it blew the
        compact stepper out to ~208px and pushed Add off the edge of the card.
      */}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        size={1}
        value={control.draft}
        onChange={(event) => control.onChange(event.target.value)}
        onBlur={control.onBlur}
        onFocus={(event) => event.target.select()}
        disabled={disabled}
        aria-label={`Quantity for ${label}`}
        className={`w-full min-w-0 bg-transparent text-center font-semibold tabular-nums outline-none focus:text-brand-blue disabled:cursor-not-allowed ${
          isLarge ? 'text-sm' : 'text-xs'
        }`}
      />

      <button
        type="button"
        onClick={() => control.commit(control.quantity + 1)}
        disabled={disabled || control.quantity >= MAX_QUANTITY}
        className={`flex items-center justify-center rounded-r-full font-semibold transition-colors hover:bg-brand-line/60 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-35 ${
          isLarge ? 'h-12' : 'h-10'
        }`}
        aria-label={`Increase quantity for ${label}`}
      >
        <Plus size={isLarge ? 16 : 14} />
      </button>
    </div>
  );
}

function QuickOrderRow({ product, vialFilter }: { product: ShopifyProduct; vialFilter: string }) {
  const {
    variants,
    variant,
    activeImage,
    hasVariantOptions,
    available,
    discountPercent,
    quantityControl,
    setSelectedVariantId,
    handleAdd,
    isAdding,
    formatCalculatedPrice,
  } = useProductOrder(product, vialFilter);

  return (
    <article className="group rounded-2xl border border-brand-line/70 bg-white px-4 py-4 shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_16px_36px_-16px_rgba(23,50,82,0.28)] sm:px-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,1.35fr)_minmax(180px,0.85fr)_minmax(360px,1.35fr)] lg:items-center">
        <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-center gap-4">
          <Link
            href={`/products/${product.handle}`}
            className="bg-catalog-hero relative h-14 w-14 overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03] sm:h-14 sm:w-14"
            aria-label={`View ${product.title}`}
          >
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={activeImage.altText ?? product.title}
                fill
                className="object-contain p-1.5 [filter:drop-shadow(0_5px_7px_rgba(0,0,0,0.55))]"
                sizes="56px"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs text-white/55">
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
                <p className="mt-1 text-sm font-medium text-brand-ink/70">
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
            <p className="text-sm font-medium text-brand-ink/70">Price available upon request</p>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
          <label className="relative block">
            <span className="sr-only">Select vial for {product.title}</span>
            <select
              disabled={!hasVariantOptions}
              value={variant?.id ?? ''}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-brand-line/70 bg-brand-surface px-4 pr-10 text-sm font-semibold text-brand-ink outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:text-brand-ink/70"
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
            <QuantityStepper
              control={quantityControl}
              label={product.title}
              disabled={isAdding}
            />
          ) : (
            <div className="flex h-12 items-center justify-center rounded-full border border-brand-line/70 bg-brand-surface px-4 text-center text-sm font-semibold text-brand-ink/75">
              Restocking soon
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!available || isAdding}
            className="bg-brand-gradient flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-brand-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-blue/30 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
          >
            {isAdding ? (
              <Loader2 className="animate-spin" size={17} />
            ) : available ? (
              'Add to Cart'
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function QuickOrderCard({ product, vialFilter }: { product: ShopifyProduct; vialFilter: string }) {
  const {
    variants,
    variant,
    activeImage,
    hasVariantOptions,
    available,
    discountPercent,
    quantityControl,
    setSelectedVariantId,
    handleAdd,
    isAdding,
    formatCalculatedPrice,
  } = useProductOrder(product, vialFilter);

  return (
    <article className="group flex flex-col rounded-2xl border border-brand-line/70 bg-white p-2.5 shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_22px_44px_-20px_rgba(23,50,82,0.3)]">
      <Link
        href={`/products/${product.handle}`}
        className="bg-catalog-hero relative block aspect-square overflow-hidden rounded-xl ring-1 ring-white/10"
        aria-label={`View ${product.title}`}
      >
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? product.title}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110 [filter:drop-shadow(0_12px_16px_rgba(0,0,0,0.55))]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white/55">
            No image
          </span>
        )}

        {discountPercent ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            Save {discountPercent}%
          </span>
        ) : null}

        <span
          className={`absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md ${
            available
              ? 'bg-white/10 text-white ring-1 ring-white/25'
              : 'bg-red-500/20 text-red-50 ring-1 ring-red-300/30'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-green-400' : 'bg-red-400'}`} />
          {available ? 'In stock' : 'Out'}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <Link
          href={`/products/${product.handle}`}
          className="line-clamp-2 min-h-[2.6em] text-[13px] font-semibold leading-snug text-brand-ink transition-colors hover:text-brand-blue"
        >
          {product.title}
        </Link>

        <div className="mt-1.5 flex items-baseline gap-1.5">
          {variant ? (
            <>
              <span className="text-lg font-extrabold tracking-tight text-brand-navy">
                {formatCalculatedPrice(variant.price.amount, variant.price.currencyCode)}
              </span>
              {discountPercent ? (
                <span className="text-xs text-brand-ink/70 line-through">
                  {formatCalculatedPrice(
                    variant.compareAtPrice!.amount,
                    variant.compareAtPrice!.currencyCode
                  )}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-xs font-medium text-brand-ink/70">Price upon request</span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-3">
          {hasVariantOptions ? (
            <label className="relative block">
              <span className="sr-only">Select variant for {product.title}</span>
              <select
                value={variant?.id ?? ''}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                className="h-10 w-full appearance-none rounded-full border border-brand-line/70 bg-brand-surface pl-3.5 pr-9 text-xs font-semibold text-brand-ink outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
              >
                {variants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {variantLabel(product, item)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/60"
                size={14}
              />
            </label>
          ) : null}

          {/*
            Wraps rather than overflows: in the 2-column grid on a small phone
            the card is only ~133px wide, which can't fit the stepper and the
            button side by side. There, Add drops to its own full-width row.
          */}
          <div className="flex flex-wrap items-center gap-2">
            {available ? (
              <QuantityStepper
                control={quantityControl}
                label={product.title}
                size="sm"
                disabled={isAdding}
              />
            ) : null}

            <button
              type="button"
              onClick={handleAdd}
              disabled={!available || isAdding}
              className="bg-brand-gradient flex h-10 min-w-[72px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-brand-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
            >
              {isAdding ? (
                <Loader2 className="animate-spin" size={15} />
              ) : available ? (
                'Add'
              ) : (
                'Out of Stock'
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function QuickOrderCatalogInner({
  products,
  collections,
  activeHandle,
  title = 'Quick Order',
  eyebrow,
  description,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vialOptions = useMemo(() => getVialValues(products), [products]);

  // The URL is the source of truth for filters, so returning from a product
  // page (or sharing the link) restores exactly what the buyer was looking at.
  const readParams = useCallback(() => {
    const rawStock = searchParams.get('stock') as StockFilter | null;
    const rawSort = searchParams.get('sort') as SortOption | null;
    const rawView = searchParams.get('view');

    return {
      search: searchParams.get('q') ?? '',
      stockFilter: rawStock && STOCK_FILTERS.includes(rawStock) ? rawStock : ('all' as StockFilter),
      vialFilter: searchParams.get('vial') ?? 'all',
      sort: rawSort && SORT_OPTIONS.includes(rawSort) ? rawSort : ('alpha-az' as SortOption),
      view: (rawView === 'grid' ? 'grid' : 'list') as ViewOption,
    };
  }, [searchParams]);

  // Seeded from the URL once; the controls are the source of truth from there.
  const [initial] = useState(readParams);
  const [search, setSearch] = useState(initial.search);
  const [stockFilter, setStockFilter] = useState<StockFilter>(initial.stockFilter);
  const [vialFilter, setVialFilter] = useState(initial.vialFilter);
  const [sort, setSort] = useState<SortOption>(initial.sort);
  const [view, setView] = useState<ViewOption>(initial.view);

  const applyParams = useCallback((next: ReturnType<typeof readParams>) => {
    setSearch(next.search);
    setStockFilter(next.stockFilter);
    setVialFilter(next.vialFilter);
    setSort(next.sort);
    setView(next.view);
  }, []);

  // Mirror the controls into the query string with the native History API.
  //
  // `router.replace` would re-run this route's server component on every
  // keystroke — and these pages fetch the entire catalog from Shopify — so the
  // URL is updated without asking Next to navigate. Typing is debounced on top
  // of that to keep the history entry from thrashing.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (stockFilter !== 'all') params.set('stock', stockFilter);
    if (vialFilter !== 'all') params.set('vial', vialFilter);
    if (sort !== 'alpha-az') params.set('sort', sort);
    if (view !== 'list') params.set('view', view);

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    const timeout = setTimeout(() => {
      if (`${window.location.pathname}${window.location.search}` === nextUrl) return;
      window.history.replaceState(null, '', nextUrl);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, stockFilter, vialFilter, sort, view, pathname]);

  // Back/forward can land on this page with a different query string without
  // remounting it — re-read the URL when that happens.
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const rawStock = params.get('stock') as StockFilter | null;
      const rawSort = params.get('sort') as SortOption | null;

      applyParams({
        search: params.get('q') ?? '',
        stockFilter: rawStock && STOCK_FILTERS.includes(rawStock) ? rawStock : 'all',
        vialFilter: params.get('vial') ?? 'all',
        sort: rawSort && SORT_OPTIONS.includes(rawSort) ? rawSort : 'alpha-az',
        view: params.get('view') === 'grid' ? 'grid' : 'list',
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyParams]);

  const hasActiveFilters =
    search.trim() !== '' || stockFilter !== 'all' || vialFilter !== 'all' || sort !== 'alpha-az';

  const clearFilters = () => {
    setSearch('');
    setStockFilter('all');
    setVialFilter('all');
    setSort('alpha-az');
  };

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
      <PageHeader
        eyebrow={eyebrow || 'Catalog'}
        title={title}
        icon={Boxes}
        description={
          description ||
          `${visibleProducts.length} product${visibleProducts.length === 1 ? '' : 's'} available`
        }
        actions={
          <label className="relative block w-full">
            <span className="sr-only">Search products</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              type="search"
              className="h-12 w-full rounded-full border border-white/20 bg-white/95 px-5 pr-11 text-base text-brand-ink outline-none backdrop-blur-sm transition-all placeholder:text-brand-ink/60 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/20"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-brand-ink/70 transition-colors hover:bg-brand-mist hover:text-brand-navy"
              >
                <X size={16} />
              </button>
            ) : (
              <Search
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/60"
                size={20}
              />
            )}
          </label>
        }
      />

      <div className="sticky top-[72px] z-20 mb-8 flex flex-col gap-4 rounded-2xl border border-brand-line/70 bg-white/80 px-4 py-3 shadow-[0_8px_24px_-18px_rgba(23,50,82,0.4)] backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <span className="hidden md:inline text-base font-semibold text-brand-ink">Filter:</span>

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

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-brand-line px-4 text-sm font-semibold text-brand-ink/70 transition-all hover:border-brand-blue/40 hover:text-brand-navy"
            >
              <X size={15} /> Clear filters
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
          <div className="flex items-center rounded-full border border-brand-line bg-brand-surface p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                view === 'grid'
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-brand-ink/70 hover:text-brand-blue'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                view === 'list'
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'text-brand-ink/70 hover:text-brand-blue'
              }`}
            >
              <List size={16} />
            </button>
          </div>
          <span className="hidden md:inline text-base font-semibold text-brand-ink">Sort by:</span>
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
          <span className="text-base font-semibold text-brand-ink/70" aria-live="polite">
            {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleProducts.map((product) => (
              <QuickOrderCard key={product.id} product={product} vialFilter={vialFilter} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleProducts.map((product) => (
              <QuickOrderRow key={product.id} product={product} vialFilter={vialFilter} />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-brand-line/70 bg-white px-6 py-20 text-center shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
            <Search size={24} />
          </div>
          <p className="text-lg font-semibold text-brand-navy">No products found</p>
          <p className="mt-2 text-sm text-brand-ink/70">
            {hasActiveFilters
              ? 'No products match the filters you applied.'
              : 'There are no products to show in this collection yet.'}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <X size={16} /> Clear filters
              </button>
            ) : null}
            {activeHandle !== 'all' ? (
              <Link
                href="/collections/all"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-sm"
              >
                <Boxes size={16} /> Browse full catalog
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * `useSearchParams` needs a Suspense boundary so the catalog routes can still
 * be prerendered.
 */
export default function QuickOrderCatalog(props: Props) {
  return (
    <Suspense fallback={<CatalogLoading />}>
      <QuickOrderCatalogInner {...props} />
    </Suspense>
  );
}
