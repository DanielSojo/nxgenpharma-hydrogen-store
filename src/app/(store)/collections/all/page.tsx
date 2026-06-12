import { getCollections, getProducts } from '@/lib/shopify';
import QuickOrderCatalog from '@/components/store/QuickOrderCatalog';
import type { Metadata } from 'next';

const PAGE_SIZE = 250;

export const metadata: Metadata = {
  title: 'Quick Order',
  description: 'Browse and order from the complete product catalog.',
};

export default async function AllCollectionsPage() {
  const [productsData, collections] = await Promise.all([
    getProducts({ first: PAGE_SIZE, sortKey: 'TITLE' }),
    getCollections(50),
  ]);

  return (
    <QuickOrderCatalog
      products={productsData?.nodes ?? []}
      collections={collections ?? []}
      activeHandle="all"
    />
  );
}
