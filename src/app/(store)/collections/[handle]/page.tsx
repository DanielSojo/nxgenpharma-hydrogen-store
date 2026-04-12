import { getCollectionByHandle, getCollectionProductsByHandle, getCollections } from '@/lib/shopify';
import { notFound, redirect } from 'next/navigation';
import CollectionFilter from '@/components/store/CollectionFilter';
import ProductCard from '@/components/store/ProductCard';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{
    after?: string;
    history?: string;
  }>;
}

function parseHistory(history?: string) {
  return history ? history.split(',').filter(Boolean) : [];
}

function buildCollectionHref(handle: string, after: string | null, history: string[]) {
  const params = new URLSearchParams();

  if (after) params.set('after', after);
  if (history.length > 0) params.set('history', history.join(','));

  const query = params.toString();
  return query ? `/collections/${handle}?${query}` : `/collections/${handle}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (handle === 'all') redirect('/collections/all');
  const collection = await getCollectionByHandle(handle);
  if (!collection) return { title: 'Collection Not Found' };
  return { title: collection.title, description: collection.description };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  if (handle === 'all') redirect('/collections/all');
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentAfter = resolvedSearchParams.after ?? null;
  const history = parseHistory(resolvedSearchParams.history);

  const [collection, collections] = await Promise.all([
    getCollectionProductsByHandle({ handle, first: PAGE_SIZE, after: currentAfter }),
    getCollections(50),
  ]);
  if (!collection) notFound();

  const products = collection.products.nodes;
  const hasNextPage = Boolean(collection.products.pageInfo?.hasNextPage);
  const nextCursor = collection.products.pageInfo?.endCursor ?? null;
  const previousAfter = history.length > 0 ? history[history.length - 1] : null;
  const previousHistory = history.slice(0, -1);
  const page = currentAfter ? history.length + 2 : 1;
  const nextHistory = currentAfter ? [...history, currentAfter] : history;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
          Collection
        </p>
        <h1 className="mb-2 text-3xl font-bold text-brand-navy">{collection.title}</h1>
        {collection.description && (
          <p className="max-w-2xl text-base leading-relaxed text-brand-ink/65">
            {collection.description}
          </p>
        )}
        <p className="mt-2 text-sm text-brand-ink/55">
          Page {page} • {products.length} product{products.length !== 1 ? 's' : ''} on this page
        </p>
      </div>

      <CollectionFilter collections={collections ?? []} activeHandle={handle} />

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl border border-brand-line bg-white px-4 py-4">
            <div className="text-sm text-brand-ink/60">
              Continue through this collection page by page.
            </div>
            <div className="flex items-center gap-2">
              {currentAfter ? (
                <Link
                  href={buildCollectionHref(handle, previousAfter, previousHistory)}
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
                  href={buildCollectionHref(handle, nextCursor, nextHistory)}
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
          <p className="mb-2 text-lg font-medium">No products in this collection</p>
          <p className="text-sm">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
