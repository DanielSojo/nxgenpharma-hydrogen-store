'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { ShopifyProduct } from '@/types';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';

export default function SimilarProducts({ products }: { products: ShopifyProduct[] }) {
  const { formatCalculatedPrice } = useCustomerPricing();

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-brand-line/70 pt-12">
      <div className="mb-6">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-brand-blue">
          More to explore
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-brand-navy">Similar products</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => {
          const image = product.featuredImage ?? product.variants.nodes[0]?.image ?? null;
          const available = product.availableForSale;
          const price = product.priceRange?.minVariantPrice;

          return (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line/70 bg-white shadow-[0_2px_10px_-4px_rgba(23,50,82,0.12)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_22px_44px_-20px_rgba(23,50,82,0.3)]"
            >
              <div className="relative aspect-square overflow-hidden bg-brand-surface">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/35">
                    No image
                  </span>
                )}

                <span
                  className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                    available
                      ? 'bg-green-50/90 text-green-700 ring-1 ring-green-600/15'
                      : 'bg-red-50/90 text-red-600 ring-1 ring-red-500/15'
                  }`}
                >
                  {available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {available ? 'In stock' : 'Out'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                {product.vendor ? (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand-ink/45">
                    {product.vendor}
                  </p>
                ) : null}
                <p className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-snug text-brand-ink transition-colors group-hover:text-brand-blue">
                  {product.title}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-base font-bold text-brand-navy">
                    {price ? formatCalculatedPrice(price.amount, price.currencyCode) : '—'}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-brand-blue transition-all group-hover:bg-brand-blue group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
