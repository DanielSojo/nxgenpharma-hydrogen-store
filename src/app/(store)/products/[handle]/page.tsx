import { getProductByHandle } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import AddToQuoteButton from '@/components/store/AddToQuoteButton';
import type { Metadata } from 'next';

interface Props {
  params: { handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.title, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductByHandle(params.handle);
  if (!product) notFound();

  const firstVariant = product.variants.nodes[0];
  const images = product.images.nodes;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f8f7f4]">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#ccc] text-sm">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#f8f7f4]">
                  <Image src={img.url} alt={img.altText ?? ''} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.vendor && (
            <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
              {product.vendor}
            </p>
          )}
          <h1 className="text-3xl font-bold text-[#111] mb-4">{product.title}</h1>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-semibold text-[#2b7fff]">
              Price available upon quote request
            </span>
          </div>

          {/* Variants */}
          {product.options.map((option) =>
            option.values.length > 1 ? (
              <div key={option.name} className="mb-5">
                <p className="text-sm font-semibold text-[#333] mb-2">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      className="px-4 py-2 border border-[#e0dbd2] rounded-lg text-sm text-[#333] hover:border-[#2b7fff] hover:text-[#2b7fff] transition-colors"
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )}

          {/* Add to Quote */}
          <AddToQuoteButton product={product} selectedVariant={firstVariant} />

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#f8f7f4] rounded-full text-xs text-[#666]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="mt-8 pt-8 border-t border-[#eeebe6] prose prose-sm max-w-none text-[#555]"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>

      </div>
    </div>
  );
}