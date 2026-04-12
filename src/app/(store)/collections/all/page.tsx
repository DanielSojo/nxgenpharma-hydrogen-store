import { getCollections, getProducts } from '@/lib/shopify';
import CollectionFilter from '@/components/store/CollectionFilter';
import ProductCard from '@/components/store/ProductCard';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 24;

interface Props {
  searchParams?: Promise<{
    after?: string;
    history?: string;
  }>;
}

function parseHistory(history?: string) {
  return history ? history.split(',').filter(Boolean) : [];
}

function buildCatalogHref(after: string | null, history: string[]) {
  const params = new URLSearchParams();

  if (after) params.set('after', after);
  if (history.length > 0) params.set('history', history.join(','));

  const query = params.toString();
  return query ? `/collections/all?${query}` : '/collections/all';
}

export const metadata: Metadata = {
  title: 'Full Catalog',
  description: 'Browse our complete product catalog.',
};

export default async function AllCollectionsPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentAfter = resolvedSearchParams.after ?? null;
  const history = parseHistory(resolvedSearchParams.history);

  const [productsData, collections] = await Promise.all([
    getProducts({ first: PAGE_SIZE, after: currentAfter ?? undefined, sortKey: 'TITLE' }),
    getCollections(50),
  ]);
  const products = productsData?.nodes ?? [];
  const hasNextPage = Boolean(productsData?.pageInfo?.hasNextPage);
  const nextCursor = productsData?.pageInfo?.endCursor ?? null;
  const previousAfter = history.length > 0 ? history[history.length - 1] : null;
  const previousHistory = history.slice(0, -1);
  const page = currentAfter ? history.length + 2 : 1;
  const nextHistory = currentAfter ? [...history, currentAfter] : history;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
          B2B Catalog
        </p>
        <h1 className="mb-2 text-3xl font-bold text-brand-navy">All Products</h1>
        <p className="text-base text-brand-ink/65">
          Page {page} • {products.length} product{products.length !== 1 ? 's' : ''} on this page
        </p>
      </div>

      <CollectionFilter collections={collections ?? []} activeHandle="all" />

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-brand-line bg-white px-4 py-4">
            <div className="text-sm text-brand-ink/60">
              Browse the full catalog page by page.
            </div>
            <div className="flex items-center gap-2">
              {currentAfter ? (
                <Link
                  href={buildCatalogHref(previousAfter, previousHistory)}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-brand-navy opacity-40">
                  <ChevronLeft size={16} />
                  Previous
                </span>
              )}

              {hasNextPage && nextCursor ? (
                <Link
                  href={buildCatalogHref(nextCursor, nextHistory)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue"
                >
                  Next
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white opacity-40">
                  Next
                  <ChevronRight size={16} />
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="py-24 text-center text-brand-ink/50">
          <p className="mb-2 text-lg font-medium">No products found</p>
          <p className="text-sm">Add products in your Shopify Admin to see them here.</p>
        </div>
      )}

    </div>
  );
}
