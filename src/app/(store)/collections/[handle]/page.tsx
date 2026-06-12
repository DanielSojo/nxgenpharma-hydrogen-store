import { getCollectionByHandle, getCollectionProductsByHandle, getCollections } from '@/lib/shopify';
import { notFound, redirect } from 'next/navigation';
import QuickOrderCatalog from '@/components/store/QuickOrderCatalog';
import type { Metadata } from 'next';

const PAGE_SIZE = 250;

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
    getCollectionProductsByHandle({ handle, first: PAGE_SIZE }),
    getCollections(50),
  ]);
  if (!collection) notFound();

  return (
    <QuickOrderCatalog
      products={collection.products.nodes}
      collections={collections ?? []}
      activeHandle={handle}
      eyebrow="Collection"
      title={collection.title}
      description={collection.description}
    />
  );
}
