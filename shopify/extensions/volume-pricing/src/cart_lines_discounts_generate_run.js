// @ts-check

/**
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunInput} CartLinesDiscountsGenerateRunInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
 * @typedef {{ min: number, price: number }} VolumeTier
 */

/**
 * Cuando es `true`, la cantidad que decide el nivel es la suma de todas las
 * variantes del mismo producto en el carrito (5 x 10mg + 6 x 20mg = 11 → nivel
 * de 11+). Con `false` cada línea (variante) cuenta por separado.
 */
export const GROUP_BY_PRODUCT = false;

/**
 * Keeps only well-formed tiers from the variant's `custom.volume_pricing` metafield,
 * sorted by `min` ascending. Anything else (not an array, bad entries, a
 * metafield that isn't set) yields no tiers, so the line gets no discount.
 *
 * @param {unknown} value
 * @returns {VolumeTier[]}
 */
export function parseVolumeTiers(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (tier) =>
        tier !== null &&
        typeof tier === 'object' &&
        Number.isInteger(tier.min) &&
        tier.min >= 1 &&
        typeof tier.price === 'number' &&
        Number.isFinite(tier.price) &&
        tier.price > 0
    )
    .map((tier) => ({ min: tier.min, price: tier.price }))
    .sort((a, b) => a.min - b.min);
}

/**
 * The highest tier the quantity reaches, if any.
 *
 * @param {number} quantity
 * @param {VolumeTier[]} tiers sorted by `min` ascending
 * @returns {VolumeTier | undefined}
 */
export function findTier(quantity, tiers) {
  let match;
  for (const tier of tiers) {
    if (quantity >= tier.min) match = tier;
  }
  return match;
}

/** @param {number} amount */
function formatPrice(amount) {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/**
 * Brings each line's unit price down to its volume tier price. The variant's
 * regular price in Shopify is the first tier, so the discount is the gap
 * between that price and the tier the quantity reaches.
 *
 * Shopify computes the final price at checkout from this; the Next.js app only
 * shows the tier table and the totals the Storefront API returns.
 *
 * @param {CartLinesDiscountsGenerateRunInput} input
 * @param {{ groupByProduct?: boolean }} [options] for tests; Shopify calls with input only
 * @returns {CartLinesDiscountsGenerateRunResult}
 */
export function cartLinesDiscountsGenerateRun(input, options = {}) {
  const groupByProduct = options.groupByProduct ?? GROUP_BY_PRODUCT;

  if (!input.discount.discountClasses.includes('PRODUCT')) {
    return { operations: [] };
  }

  const lines = input.cart.lines.filter(
    (line) => line.merchandise.__typename === 'ProductVariant'
  );

  /** @param {(typeof lines)[number]} line */
  const quantityKey = (line) =>
    groupByProduct && line.merchandise.__typename === 'ProductVariant'
      ? line.merchandise.product.id
      : line.id;

  /** @type {Map<string, number>} */
  const quantities = new Map();
  for (const line of lines) {
    const key = quantityKey(line);
    quantities.set(key, (quantities.get(key) ?? 0) + line.quantity);
  }

  const candidates = [];

  for (const line of lines) {
    if (line.merchandise.__typename !== 'ProductVariant') continue;

    const tiers = parseVolumeTiers(line.merchandise.volumePricing?.jsonValue);
    const tier = findTier(quantities.get(quantityKey(line)) ?? 0, tiers);
    if (!tier) continue;

    const basePrice = parseFloat(line.cost.amountPerQuantity.amount);
    if (!Number.isFinite(basePrice)) continue;

    // Redondeado a centavos para evitar 100 - 90.1 = 9.900000000000006.
    const discountAmount = Math.round((basePrice - tier.price) * 100) / 100;
    if (discountAmount <= 0) continue;

    candidates.push({
      message: `Volume price: ${formatPrice(tier.price)} each`,
      targets: [{ cartLine: { id: line.id } }],
      value: {
        fixedAmount: { amount: discountAmount.toFixed(2), appliesToEachItem: true },
      },
    });
  }

  if (!candidates.length) return { operations: [] };

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: 'ALL',
        },
      },
    ],
  };
}
