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
      className="group flex flex-col bg-white border border-[#eeebe6] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#d0cbc3] transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f8f7f4] overflow-hidden">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#ccc] text-xs">
            No image
          </div>
        )}
        {!product.availableForSale && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-[#999] uppercase tracking-widest">Sold Out</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-[#2b7fff] text-white text-[11px] font-bold rounded-md">
            SALE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        {product.vendor && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2b7fff]">
            {product.vendor}
          </p>
        )}
        <p className="text-sm font-semibold text-[#111] leading-snug line-clamp-2">
          {product.title}
        </p>
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-sm font-semibold text-[#2b7fff]">
            Request Quote
          </span>
        </div>
      </div>
    </Link>
  );
}