import type { PendingCheckout } from '@/types';

/**
 * Custom attribute stamped on the cart before the buyer leaves for Shopify's
 * hosted checkout. Cart attributes carry through to the resulting order, so the
 * success page can ask "which order came from this cart?" without webhooks.
 *
 * Deliberately not underscore-prefixed: Shopify hides `_`-prefixed attributes
 * from the admin order view, and we want support staff to see it too.
 */
export const CHECKOUT_REF_ATTRIBUTE = 'checkout_ref';

/**
 * Cart attribute holding the URL Shopify's thank-you page should send the buyer
 * back to. Stamped alongside the ref so the merchant-side link is generic.
 */
export const RETURN_URL_ATTRIBUTE = 'return_url';

/** localStorage key holding the in-flight checkout while the buyer is on Shopify. */
export const PENDING_CHECKOUT_KEY = 'pendingCheckout';

/** localStorage key holding the Shopify cart id. Pre-existing convention. */
export const CART_ID_KEY = 'cartId';

/**
 * Shopify checkout is a limited pilot; everyone else stays on the quote flow.
 * The allowlist lives in NEXT_PUBLIC_CHECKOUT_EMAILS (comma-separated) rather
 * than in code, so collaborators' emails are never committed to the repo.
 *
 * Fails closed: unset or empty disables checkout for everyone.
 */
export function canUseCheckout(email?: string | null): boolean {
  if (!email) return false;

  const allowed = (process.env.NEXT_PUBLIC_CHECKOUT_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
}

export function createCheckoutRef(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `nxg-${Date.now().toString(36)}-${random}`;
}

export function savePendingCheckout(pending: PendingCheckout) {
  try {
    localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
  } catch {
    // Private browsing / storage disabled — the ref also travels in the return
    // URL, so checkout still reconciles without this.
  }
}

export function readPendingCheckout(): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    return parsed?.ref ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  try {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // no-op
  }
}

/**
 * Where Shopify should send the buyer once payment is done. Shopify's hosted
 * thank-you page can't redirect off-domain on its own, so this URL is what the
 * merchant points the order-status "Continue shopping" button at (see README).
 */
export function buildReturnUrl(ref: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  return `${base.replace(/\/+$/, '')}/checkout/success?ref=${encodeURIComponent(ref)}`;
}
