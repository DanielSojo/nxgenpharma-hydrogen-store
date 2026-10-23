'use client';

import { useState } from 'react';
import { Minus, Plus, Layers } from 'lucide-react';
import { useCustomerPricing } from '@/hooks/useCustomerPricing.hook';
import {
  formatTierRange,
  getActiveTier,
  getTierRanges,
  type VolumeTier,
} from '@/lib/volume-pricing';

interface Props {
  tiers: VolumeTier[];
  currencyCode: string;
}

/**
 * Shows the product's quantity tiers and an estimate for a chosen quantity.
 * The figures here are only an estimate: Shopify applies the real price at
 * checkout through the volume pricing discount.
 */
export default function VolumePricingTable({ tiers, currencyCode }: Props) {
  const { formatCalculatedPrice } = useCustomerPricing();
  const [quantity, setQuantity] = useState(tiers[0]?.min ?? 1);

  if (tiers.length === 0) return null;

  const ranges = getTierRanges(tiers);
  const activeTier = getActiveTier(quantity, tiers);
  const setClamped = (value: number) => setQuantity(Math.max(1, Math.floor(value) || 1));

  return (
    <div className="mb-5 rounded-2xl border border-brand-line/70 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)]">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-blue">
        <Layers size={14} /> Volume pricing
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-brand-ink/70">
            <th className="pb-2 font-medium">Quantity</th>
            <th className="pb-2 text-right font-medium">Price / unit</th>
          </tr>
        </thead>
        <tbody>
          {ranges.map((range) => {
            const isActive = range.min === activeTier?.min;
            return (
              <tr
                key={range.min}
                aria-current={isActive ? 'true' : undefined}
                className={isActive ? 'bg-brand-mist font-semibold text-brand-navy' : 'text-brand-ink'}
              >
                <td className="rounded-l-lg px-2 py-1.5">{formatTierRange(range)}</td>
                <td className="rounded-r-lg px-2 py-1.5 text-right tabular-nums">
                  {formatCalculatedPrice(range.price, currencyCode)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-line/70 pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClamped(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={12} />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setClamped(Number(event.target.value))}
            aria-label="Quantity for estimate"
            className="w-14 rounded-lg border border-brand-line px-2 py-1 text-center text-sm font-semibold text-brand-ink tabular-nums"
          />
          <button
            type="button"
            onClick={() => setClamped(quantity + 1)}
            aria-label="Increase quantity"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist text-brand-ink/70 transition-colors hover:bg-brand-line hover:text-brand-blue"
          >
            <Plus size={12} />
          </button>
        </div>

        {activeTier && (
          <div className="text-right text-sm">
            <p className="text-brand-ink/70">
              Estimated unit price:{' '}
              <span className="font-semibold text-brand-navy">
                {formatCalculatedPrice(activeTier.price, currencyCode)}
              </span>
            </p>
            <p className="text-brand-ink/70">
              Estimated subtotal:{' '}
              <span className="font-bold text-brand-navy">
                {formatCalculatedPrice(activeTier.price * quantity, currencyCode)}
              </span>
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[12px] text-brand-ink/70">
        Estimates only. The final price is applied in your cart and at checkout.
      </p>
    </div>
  );
}
