import { getCollectionByHandle, getCollections } from '@/lib/shopify';
import { notFound, redirect } from 'next/navigation';
import CollectionFilter from '@/components/store/CollectionFilter';
import ProductCard from '@/components/store/ProductCard';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (handle === 'all') redirect('/collections/all');
  const collection = await getCollectionByHandle(handle);
  if (!collection) return { title: 'Collection Not Found' };
  return { title: collection.title, description: collection.description };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  if (handle === 'all') redirect('/collections/all');

  const [collection, collections] = await Promise.all([
    getCollectionByHandle(handle, 48),
    getCollections(50),
  ]);
  if (!collection) notFound();

  const products = collection.products.nodes;

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
      </div>

      <CollectionFilter collections={collections ?? []} activeHandle={handle} />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-brand-ink/50">
          <p className="mb-2 text-lg font-medium">No products in this collection</p>
          <p className="text-sm">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
