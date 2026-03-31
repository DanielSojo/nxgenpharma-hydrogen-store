import { getProducts, getCollections } from '@/lib/shopify';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const [productsData, collections] = await Promise.all([
    getProducts({ first: 8 }),
    getCollections(6),
  ]);

  const products = productsData?.nodes ?? [];

  return (
    <div className="bg-brand-surface">

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue py-24 text-white px-6">
        <div className="max-w-5xl mx-auto">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-aqua">
            B2B Pharmaceutical Platform
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-6 max-w-2xl">
            Professional-Grade Supply for Your Practice
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/74">
            Access our full catalog of pharmaceutical products. Verified accounts only — quality assured, competitively priced.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-mist"
            >
              Browse Catalog <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-brand-aqua hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Collections */}
      {collections?.length > 0 && (
        <section className="bg-brand-mist py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-brand-navy">Shop by Category</h2>
              <Link href="/collections" className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-navy">
                All categories <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.handle}`}
                  className="flex items-center justify-center group rounded-xl border border-brand-line bg-white p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-brand-ink transition-colors group-hover:text-brand-blue">
                    {col.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-navy">Featured Products</h2>
            <Link href="/collections/all" className="flex items-center gap-1 text-sm text-brand-blue hover:text-brand-navy">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-brand-ink/55">
              No products found. Add products in your Shopify admin.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
