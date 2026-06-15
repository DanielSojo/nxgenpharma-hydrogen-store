import { getProductByHandle } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/collections/all"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/55 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft size={16} /> Back to catalog
      </Link>
      <ProductVariantDetails product={product} />
    </div>
  );
}
