'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export interface ReorderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id?: string | null;
    availableForSale?: boolean | null;
  } | null;
}

interface Props {
  lineItems: ReorderLineItem[];
  /** `compact` is the inline variant used inside an order row. */
  size?: 'default' | 'compact';
  className?: string;
}

/**
 * Rebuilds a past order in the cart in one click — the single most common
 * action for repeat wholesale buyers, who previously had to search for and
 * re-add every line by hand.
 *
 * Lines are added sequentially: the first add is what creates the cart, so the
 * rest need its id.
 */
export default function ReorderButton({ lineItems, size = 'default', className = '' }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const reorderable = lineItems.filter((item) => Boolean(item.variant?.id));
  // Nothing to rebuild (an older order whose variants are gone) — hide it
  // rather than offering a button that can only fail.
  if (reorderable.length === 0) return null;

  const handleReorder = async () => {
    if (busy) return;
    setBusy(true);

    let added = 0;
    const skipped: string[] = [];

    try {
      for (const item of reorderable) {
        if (item.variant?.availableForSale === false) {
          skipped.push(item.title);
          continue;
        }

        const ok = await addItem(item.variant!.id!, Math.max(1, item.quantity), { silent: true });
        if (ok) added += 1;
        else skipped.push(item.title);
      }

      if (added === 0) {
        toast.error('None of these items are available to reorder right now.');
        return;
      }

      toast.success(`${added} item${added === 1 ? '' : 's'} added to your cart`, {
        description:
          skipped.length > 0
            ? `Unavailable and skipped: ${skipped.join(', ')}`
            : undefined,
        action: { label: 'View cart', onClick: openCart },
      });

      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const isCompact = size === 'compact';

  return (
    <button
      type="button"
      onClick={handleReorder}
      disabled={busy}
      aria-label={`Reorder ${reorderable.length} item${reorderable.length === 1 ? '' : 's'}`}
      className={
        isCompact
          ? `inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-white px-3.5 py-2 text-xs font-semibold text-brand-navy transition-all duration-200 hover:border-brand-blue/40 hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-60 ${className}`
          : `bg-brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${className}`
      }
    >
      {busy ? (
        <Loader2 size={isCompact ? 13 : 16} className="animate-spin" />
      ) : (
        <RotateCcw size={isCompact ? 13 : 16} />
      )}
      {busy ? 'Adding…' : 'Reorder'}
    </button>
  );
}
