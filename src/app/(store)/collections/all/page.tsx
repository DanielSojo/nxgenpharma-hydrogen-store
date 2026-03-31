import { getCollections, getProducts } from '@/lib/shopify';
import CollectionFilter from '@/components/store/CollectionFilter';
import ProductCard from '@/components/store/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Catalog',
  description: 'Browse our complete product catalog.',
};

export default async function AllCollectionsPage() {
  const [productsData, collections] = await Promise.all([
    getProducts({ first: 48, sortKey: 'TITLE' }),
    getCollections(50),
  ]);
  const products = productsData?.nodes ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
          B2B Catalog
        </p>
        <h1 className="mb-2 text-3xl font-bold text-brand-navy">All Products</h1>
        <p className="text-base text-brand-ink/65">
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <CollectionFilter collections={collections ?? []} activeHandle="all" />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-brand-ink/50">
          <p className="mb-2 text-lg font-medium">No products found</p>
          <p className="text-sm">Add products in your Shopify Admin to see them here.</p>
        </div>
      )}

    </div>
  );
}
