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
    <div className="bg-white">

      {/* Hero */}
      <section className="bg-[#0a0a0a] text-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[#888] text-sm font-medium tracking-widest uppercase mb-4">
            B2B Pharmaceutical Platform
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-6 max-w-2xl">
            Professional-Grade Supply for Your Practice
          </h1>
          <p className="text-[#aaa] text-lg leading-relaxed max-w-xl mb-10">
            Access our full catalog of pharmaceutical products. Verified accounts only — quality assured, competitively priced.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2b7fff] hover:bg-[#1a6fee] text-white rounded-full text-sm font-semibold transition-colors"
            >
              Browse Catalog <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#333] hover:border-[#666] text-white rounded-full text-sm font-semibold transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Collections */}
      {collections?.length > 0 && (
        <section className="py-16 px-6 bg-[#f8f7f4]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#111]">Shop by Category</h2>
              <Link href="/collections" className="text-sm text-[#2b7fff] hover:opacity-70 flex items-center gap-1">
                All categories <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.handle}`}
                  className="bg-white rounded-xl p-5 text-center hover:shadow-md transition-shadow border border-[#eeebe6] group"
                >
                  <p className="text-sm font-semibold text-[#333] group-hover:text-[#2b7fff] transition-colors">
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
            <h2 className="text-2xl font-bold text-[#111]">Featured Products</h2>
            <Link href="/collections/all" className="text-sm text-[#2b7fff] hover:opacity-70 flex items-center gap-1">
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
            <div className="text-center py-20 text-[#999]">
              No products found. Add products in your Shopify admin.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white py-16 px-6 mt-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-4">
              <path d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
                stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-[#666] text-sm leading-relaxed">
              Professional pharmaceutical supply for verified B2B clients.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#888] mb-4">Shipping</h4>
            <p className="text-[#666] text-sm leading-relaxed">
              Mon – Thurs / Except Holidays<br />
              Sat Delivery Available
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#888] mb-4">Contact</h4>
            <p className="text-[#666] text-sm leading-relaxed">
              Business Inquiries Only<br />
              Mon – Friday 9AM – 5PM
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#888] mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              {['Terms of Service', 'Privacy Policy', 'Refund Policy'].map((link) => (
                <Link key={link} href="#" className="text-[#666] hover:text-white text-sm transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-[#1a1a1a] text-center text-[#555] text-sm">
          © {new Date().getFullYear()} NxGen Pharma. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
