import Link from 'next/link';
import Image from 'next/image';
import type { ShopifyProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: Props) {
  const variant = product.variants.nodes[0];
  const hasDiscount =
    variant?.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-all hover:-translate-y-1 hover:border-brand-aqua hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-brand-mist">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-brand-ink/35">
            No image
          </div>
        )}
        {!product.availableForSale && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-ink/45">Sold Out</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-md bg-brand-navy px-2 py-1 text-[11px] font-bold text-white">
            SALE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.vendor && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">
            {product.vendor}
          </p>
        )}
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-navy">
          {product.title}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-sm font-semibold text-brand-teal">
            Request Quote
          </span>
        </div>
      </div>
    </Link>
  );
}
