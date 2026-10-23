import { describe, expect, test } from 'vitest';
import {
  formatTierRange,
  getActiveTier,
  getTierPrice,
  getTierRanges,
  isLineDiscounted,
  parseVolumeTiers,
} from '@/lib/volume-pricing';

const METAFIELD = '[{"min":1,"price":100},{"min":11,"price":90},{"min":21,"price":70}]';
const TIERS = parseVolumeTiers(METAFIELD);

describe('parseVolumeTiers', () => {
  test('parses the metafield', () => {
    expect(TIERS).toEqual([
      { min: 1, price: 100 },
      { min: 11, price: 90 },
      { min: 21, price: 70 },
    ]);
  });

  test('sorts by min', () => {
    expect(parseVolumeTiers('[{"min":21,"price":70},{"min":1,"price":100}]')).toEqual([
      { min: 1, price: 100 },
      { min: 21, price: 70 },
    ]);
  });

  test.each([undefined, null, '', 'not json', '{"min":1,"price":100}', '42', 'null', '[]'])(
    'returns no tiers for %j',
    (value) => {
      expect(parseVolumeTiers(value)).toEqual([]);
    }
  );

  test('drops malformed tiers and keeps the rest', () => {
    const value = JSON.stringify([
      null,
      'tier',
      { min: '11', price: 90 },
      { min: 11 },
      { min: 0, price: 90 },
      { min: 2.5, price: 90 },
      { min: 5, price: 0 },
      { min: 5, price: -10 },
      { min: 11, price: 90, label: 'ignored' },
    ]);
    expect(parseVolumeTiers(value)).toEqual([{ min: 11, price: 90 }]);
  });

  test('keeps the last tier when a min repeats', () => {
    expect(parseVolumeTiers('[{"min":11,"price":95},{"min":11,"price":90}]')).toEqual([
      { min: 11, price: 90 },
    ]);
  });
});

describe('getTierPrice', () => {
  test.each([
    [1, 100],
    [10, 100],
    [11, 90],
    [20, 90],
    [21, 70],
    [50, 70],
  ])('quantity %i → $%i', (quantity, price) => {
    expect(getTierPrice(quantity, TIERS)).toBe(price);
  });

  test('is undefined below the first tier or without tiers', () => {
    expect(getTierPrice(0, TIERS)).toBeUndefined();
    expect(getTierPrice(5, parseVolumeTiers('[{"min":10,"price":90}]'))).toBeUndefined();
    expect(getTierPrice(50, [])).toBeUndefined();
  });

  test('getActiveTier returns the whole tier', () => {
    expect(getActiveTier(15, TIERS)).toEqual({ min: 11, price: 90 });
  });
});

describe('getTierRanges / formatTierRange', () => {
  test('derives each max from the next min', () => {
    const ranges = getTierRanges(TIERS);
    expect(ranges).toEqual([
      { min: 1, max: 10, price: 100 },
      { min: 11, max: 20, price: 90 },
      { min: 21, max: null, price: 70 },
    ]);
    expect(ranges.map(formatTierRange)).toEqual(['1–10', '11–20', '21+']);
  });

  test('a one-quantity range shows a single number', () => {
    const ranges = getTierRanges(parseVolumeTiers('[{"min":1,"price":100},{"min":2,"price":90}]'));
    expect(ranges.map(formatTierRange)).toEqual(['1', '2+']);
  });
});

describe('isLineDiscounted', () => {
  const cost = (subtotal: string, total: string) => ({
    cost: {
      subtotalAmount: { amount: subtotal, currencyCode: 'USD' },
      totalAmount: { amount: total, currencyCode: 'USD' },
    },
  });

  test('true when Shopify returns a total below the subtotal', () => {
    expect(isLineDiscounted(cost('1500.0', '1050.0'))).toBe(true);
  });

  test('false when they match', () => {
    expect(isLineDiscounted(cost('500.0', '500.0'))).toBe(false);
  });
});
