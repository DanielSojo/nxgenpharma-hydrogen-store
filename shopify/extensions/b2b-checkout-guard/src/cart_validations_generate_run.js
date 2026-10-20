// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

const APPROVED_STATUS = 'b2b-approved';

export const SIGN_IN_MESSAGE =
  'Checkout is only available to approved NxGen accounts. Please sign in to your account and try again.';

export const NOT_APPROVED_MESSAGE =
  'Your account is not approved for ordering yet. Please contact us or request a quote instead.';

/**
 * Checkout is reserved for signed-in customers whose `custom.b2b_status` is
 * `b2b-approved`. The Next.js app enforces this before it hands out a checkout
 * URL, but the checkout itself lives on Shopify: a buyer can log out there and
 * pay as a guest, or reuse a shared link. This is the check they can't skip.
 *
 * Cart interactions are left alone — the app builds carts before it attaches
 * the customer, which only happens on the way to checkout.
 *
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  const errors = [];
  const step = input.buyerJourney.step;
  const enforce = step === 'CHECKOUT_INTERACTION' || step === 'CHECKOUT_COMPLETION';

  if (enforce) {
    const customer = input.cart.buyerIdentity?.customer;

    if (!customer) {
      errors.push({ message: SIGN_IN_MESSAGE, target: '$.cart' });
    } else if (customer.b2bStatus?.value !== APPROVED_STATUS) {
      errors.push({ message: NOT_APPROVED_MESSAGE, target: '$.cart' });
    }
  }

  return { operations: [{ validationAdd: { errors } }] };
}
