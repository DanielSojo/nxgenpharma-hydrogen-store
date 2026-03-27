import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/store/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Catalog',
  description: 'Browse our complete product catalog.',
};

export default async function AllCollectionsPage() {
  const productsData = await getProducts({ first: 48, sortKey: 'TITLE' });
  const products = productsData?.nodes ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
          B2B Catalog
        </p>
        <h1 className="text-3xl font-bold text-[#111] mb-2">All Products</h1>
        <p className="text-[#666] text-base">
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-[#999]">
          <p className="text-lg font-medium mb-2">No products found</p>
          <p className="text-sm">Add products in your Shopify Admin to see them here.</p>
        </div>
      )}

    </div>
  );
}
