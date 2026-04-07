import { getProductByHandle } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductVariantDetails from '@/components/store/ProductVariantDetails';

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <ProductVariantDetails product={product} />
    </div>
  );
}
