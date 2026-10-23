import type { ShopifyCartLine } from '@/types';

// Precios por cantidad leídos del metafield `custom.volume_pricing` de la variante,
// p. ej. [{"min":1,"price":100},{"min":11,"price":90},{"min":21,"price":70}].
//
// Solo sirven para mostrar la tabla y un estimado en la página de producto. El
// precio real lo aplica la Shopify Function `volume-pricing`
// (shopify/extensions/volume-pricing), que valida el metafield con las mismas
// reglas; el carrito siempre muestra los montos que devuelve Shopify.

export type VolumeTier = { min: number; price: number };

export type VolumeTierRange = VolumeTier & {
  /** Last quantity in the range, or null for the open-ended top tier. */
  max: number | null;
};

function isVolumeTier(value: unknown): value is VolumeTier {
  if (value === null || typeof value !== 'object') return false;
  const { min, price } = value as Record<string, unknown>;
  return (
    Number.isInteger(min) &&
    (min as number) >= 1 &&
    typeof price === 'number' &&
    Number.isFinite(price) &&
    price > 0
  );
}

/** Never throws: a missing or malformed metafield means no tiers. */
export function parseVolumeTiers(value?: string | null): VolumeTier[] {
  if (!value) return [];
  try {
    const data: unknown = JSON.parse(value);
    if (!Array.isArray(data)) return [];
    return data
      .filter(isVolumeTier)
      .map(({ min, price }) => ({ min, price }))
      .sort((a, b) => a.min - b.min)
      // Con `min` repetido gana el último, igual que en la Function.
      .filter((tier, index, sorted) => sorted[index + 1]?.min !== tier.min);
  } catch {
    return [];
  }
}

/** The highest tier the quantity reaches. `tiers` must be sorted by `min`. */
export function getActiveTier(quantity: number, tiers: VolumeTier[]): VolumeTier | undefined {
  return [...tiers].reverse().find((tier) => quantity >= tier.min);
}

export function getTierPrice(quantity: number, tiers: VolumeTier[]): number | undefined {
  return getActiveTier(quantity, tiers)?.price;
}

/** The first tier above the one the quantity reaches, to nudge toward it. */
export function getNextTier(quantity: number, tiers: VolumeTier[]): VolumeTier | undefined {
  return tiers.find((tier) => tier.min > quantity);
}

/** Each tier runs up to one before the next tier's `min`. */
export function getTierRanges(tiers: VolumeTier[]): VolumeTierRange[] {
  return tiers.map((tier, index) => {
    const next = tiers[index + 1];
    return { ...tier, max: next ? next.min - 1 : null };
  });
}

export function formatTierRange({ min, max }: VolumeTierRange): string {
  if (max === null) return `${min}+`;
  if (max === min) return `${min}`;
  return `${min}–${max}`;
}

/**
 * A line Shopify has discounted (e.g. by the volume pricing Function):
 * its total is below its subtotal.
 */
export function isLineDiscounted(line: Pick<ShopifyCartLine, 'cost'>): boolean {
  return parseFloat(line.cost.totalAmount.amount) < parseFloat(line.cost.subtotalAmount.amount);
}
