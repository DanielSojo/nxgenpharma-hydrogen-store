'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import AddToQuoteButton from '@/components/store/AddToQuoteButton';
import ProductPrice from '@/components/store/ProductPrice';
import type { ShopifyProduct } from '@/types';

interface Props {
  product: ShopifyProduct;
}

function buildInitialSelection(product: ShopifyProduct) {
  const firstVariant = product.variants.nodes[0];

  return product.options.reduce<Record<string, string>>((selection, option) => {
    const selectedValue = firstVariant?.selectedOptions.find(
      ({ name }) => name === option.name
    )?.value;

    selection[option.name] = selectedValue ?? option.values[0] ?? '';
    return selection;
  }, {});
}

export default function ProductVariantDetails({ product }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => buildInitialSelection(product)
  );

  const selectedVariant = useMemo(() => {
    return (
      product.variants.nodes.find((variant) =>
        variant.selectedOptions.every(
          (option) => selectedOptions[option.name] === option.value
        )
      ) ?? product.variants.nodes[0]
    );
  }, [product.variants.nodes, selectedOptions]);

  const activeImage = selectedVariant?.image ?? product.featuredImage;
  const galleryImages = [
    ...(activeImage ? [activeImage] : []),
    ...product.images.nodes.filter((image) => image.url !== activeImage?.url),
  ].slice(0, 5);

  const hasMultipleVariants =
    product.variants.nodes.length > 1 &&
    product.variants.nodes.some((variant) => variant.title !== 'Default Title');

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-brand-mist">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? product.title}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-brand-ink/35">
              No image
            </div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.slice(1).map((image) => (
              <div
                key={image.url}
                className="relative aspect-square overflow-hidden rounded-xl bg-brand-mist"
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? product.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        {product.vendor && (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
            {product.vendor}
          </p>
        )}

        <h1 className="mb-4 text-3xl font-bold text-brand-navy">{product.title}</h1>

        <div className="mb-4 rounded-2xl border border-brand-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-ink/50">
            Selected Variant
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-navy">
            {selectedVariant?.title !== 'Default Title'
              ? selectedVariant?.title
              : product.title}
          </p>
          {selectedVariant && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedVariant.selectedOptions.map((option) => (
                <span
                  key={`${option.name}-${option.value}`}
                  className="rounded-full bg-brand-mist px-3 py-1 text-xs font-medium text-brand-ink/70"
                >
                  {option.name}: {option.value}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-2">
          {selectedVariant ? (
            <ProductPrice
              amount={selectedVariant.price.amount}
              currencyCode={selectedVariant.price.currencyCode}
              compareAtAmount={selectedVariant.compareAtPrice?.amount}
            />
          ) : (
            <span className="text-lg font-semibold text-brand-teal">
              Price available upon quote request
            </span>
          )}
        </div>

        {product.options.map((option) =>
          option.values.length > 1 ? (
            <div key={option.name} className="mb-5">
              <p className="mb-2 text-sm font-semibold text-brand-ink">{option.name}</p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSelectedOptions((current) => ({
                          ...current,
                          [option.name]: value,
                        }))
                      }
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-brand-line text-brand-ink hover:border-brand-blue hover:text-brand-blue'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null
        )}

        {hasMultipleVariants && (
          <div className="mb-2">
            <p className="mb-2 text-sm font-semibold text-brand-ink">Available Variants</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.nodes.map((variant) => {
                const isActive = variant.id === selectedVariant?.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      const nextSelection = variant.selectedOptions.reduce<
                        Record<string, string>
                      >((selection, option) => {
                        selection[option.name] = option.value;
                        return selection;
                      }, {});

                      setSelectedOptions(nextSelection);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-brand-navy bg-brand-navy text-white'
                        : 'border-brand-line text-brand-ink/70 hover:border-brand-navy hover:text-brand-navy'
                    }`}
                  >
                    {variant.title === 'Default Title' ? product.title : variant.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedVariant && <AddToQuoteButton product={product} selectedVariant={selectedVariant} />}

        {!selectedVariant?.availableForSale && (
          <p className="mt-3 text-sm text-brand-ink/55">
            This variant is currently unavailable. Choose another option to continue.
          </p>
        )}

        {product.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-mist px-3 py-1 text-xs text-brand-ink/65"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {product.descriptionHtml && (
          <div
            className="prose prose-sm mt-8 max-w-none border-t border-brand-line pt-8 text-brand-ink/72"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}
      </div>
    </div>
  );
}
