import { describe, test, expect } from "vitest";
import {
  cartLinesDiscountsGenerateRun,
  parseVolumeTiers,
  findTier,
} from "../src/cart_lines_discounts_generate_run";

// Unit tests for the plain JS logic. default.test.js runs the same function as
// Wasm against the fixtures; these cover what fixtures can't (the grouping flag).

const TIERS = [{ min: 1, price: 100 }, { min: 11, price: 90 }, { min: 21, price: 70 }];

const line = (id, quantity, { product = 1, tiers = TIERS, price = "100.0" } = {}) => ({
  id: `gid://shopify/CartLine/${id}`,
  quantity,
  cost: { amountPerQuantity: { amount: price } },
  merchandise: {
    __typename: "ProductVariant",
    volumePricing: tiers === undefined ? null : { jsonValue: tiers },
    product: { id: `gid://shopify/Product/${product}` },
  },
});

const run = (lines, options) =>
  cartLinesDiscountsGenerateRun(
    { cart: { lines }, discount: { discountClasses: ["PRODUCT"] } },
    options
  );

const amounts = (result) =>
  (result.operations[0]?.productDiscountsAdd.candidates ?? []).map((c) => [
    c.targets[0].cartLine.id,
    c.value.fixedAmount.amount,
  ]);

describe("parseVolumeTiers", () => {
  test("sorts valid tiers by min", () => {
    expect(parseVolumeTiers([{ min: 21, price: 70 }, { min: 1, price: 100 }])).toEqual([
      { min: 1, price: 100 },
      { min: 21, price: 70 },
    ]);
  });

  test.each([null, undefined, "[]", 42, {}, { min: 1, price: 100 }])("rejects %j", (value) => {
    expect(parseVolumeTiers(value)).toEqual([]);
  });

  test("drops malformed entries and keeps the rest", () => {
    expect(
      parseVolumeTiers([
        null,
        { min: "11", price: 90 },
        { min: 0, price: 90 },
        { min: 1.5, price: 90 },
        { min: 5, price: -1 },
        { min: 5, price: 0 },
        { min: 5, price: Infinity },
        { min: 11, price: 90, extra: true },
      ])
    ).toEqual([{ min: 11, price: 90 }]);
  });
});

describe("findTier", () => {
  test.each([
    [0, undefined],
    [1, 100],
    [10, 100],
    [11, 90],
    [20, 90],
    [21, 70],
    [500, 70],
  ])("quantity %i → %s", (quantity, price) => {
    expect(findTier(quantity, TIERS)?.price).toBe(price);
  });
});

describe("cartLinesDiscountsGenerateRun", () => {
  test("rounds the discount to cents", () => {
    const tiers = [{ min: 1, price: 100 }, { min: 2, price: 90.1 }];
    expect(amounts(run([line(1, 2, { tiers })]))).toEqual([["gid://shopify/CartLine/1", "9.90"]]);
  });

  test("skips a tier priced above the variant price", () => {
    expect(run([line(1, 50, { price: "60.0" })]).operations).toEqual([]);
  });

  test("discounts down to the tier when the variant is priced above the first tier", () => {
    expect(amounts(run([line(1, 1, { price: "110.0" })]))).toEqual([
      ["gid://shopify/CartLine/1", "10.00"],
    ]);
  });

  test("ignores lines that aren't product variants", () => {
    const giftCard = { id: "gid://shopify/CartLine/9", quantity: 50, cost: { amountPerQuantity: { amount: "100.0" } }, merchandise: { __typename: "CustomProduct" } };
    expect(run([giftCard]).operations).toEqual([]);
  });

  test("counts each line on its own by default", () => {
    // 6 + 6 of the same product: neither line reaches 11 on its own.
    expect(run([line(1, 6), line(2, 6)]).operations).toEqual([]);
  });

  test("with groupByProduct, sums variants of the same product", () => {
    const result = run([line(1, 6), line(2, 6), line(3, 6, { product: 2 })], {
      groupByProduct: true,
    });
    expect(amounts(result)).toEqual([
      ["gid://shopify/CartLine/1", "10.00"],
      ["gid://shopify/CartLine/2", "10.00"],
    ]);
  });

  test("with groupByProduct, each variant still uses its own tiers", () => {
    const tiers20mg = [{ min: 1, price: 130 }, { min: 11, price: 120 }];
    const result = run([line(1, 6), line(2, 6, { tiers: tiers20mg, price: "130.0" })], {
      groupByProduct: true,
    });
    expect(amounts(result)).toEqual([
      ["gid://shopify/CartLine/1", "10.00"],
      ["gid://shopify/CartLine/2", "10.00"],
    ]);
  });
});
