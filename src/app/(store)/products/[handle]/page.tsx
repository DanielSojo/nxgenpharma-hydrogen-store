import { getProductByHandle } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import AddToQuoteButton from '@/components/store/AddToQuoteButton';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.title, description: product.description };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const firstVariant = product.variants.nodes[0];
  const images = product.images.nodes;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-mist">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-brand-ink/35">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-brand-mist">
                  <Image src={img.url} alt={img.altText ?? ''} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.vendor && (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
              {product.vendor}
            </p>
          )}
          <h1 className="mb-4 text-3xl font-bold text-brand-navy">{product.title}</h1>

          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-lg font-semibold text-brand-teal">
              Price available upon quote request
            </span>
          </div>

          {/* Variants */}
          {product.options.map((option) =>
            option.values.length > 1 ? (
              <div key={option.name} className="mb-5">
                <p className="mb-2 text-sm font-semibold text-brand-ink">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value}
                      className="rounded-lg border border-brand-line px-4 py-2 text-sm text-brand-ink transition-colors hover:border-brand-blue hover:text-brand-blue"
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
                <span key={tag} className="rounded-full bg-brand-mist px-3 py-1 text-xs text-brand-ink/65">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="prose prose-sm mt-8 max-w-none border-t border-brand-line pt-8 text-brand-ink/72"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
