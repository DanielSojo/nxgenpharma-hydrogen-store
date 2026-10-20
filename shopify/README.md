# NxGen Shopify app

Holds the Shopify Function that guards checkout. It is separate from the
Next.js app: it is deployed to Shopify with the Shopify CLI, not to Vercel.

## b2b-checkout-guard

A cart and checkout validation function. At checkout it blocks the buyer
unless they are signed in to a customer account whose `custom.b2b_status`
metafield is `b2b-approved`.

The Next.js app already refuses to start a checkout for unapproved accounts,
but the checkout page itself is Shopify's. Without this function a buyer can log
out on that page and pay as a guest, or pay from a shared checkout link, and
Shopify creates a new customer for the order.

Cart interactions are not checked. The app builds the cart first and attaches
the customer only when checkout starts.

## Setup (once)

1. `cd shopify && npm install`
2. `npm run config:link` — sign in, pick the store's organization and choose
   **Create a new app** (e.g. "NxGen Checkout Guard"). This writes
   `shopify.app.toml` with the app's `client_id`. Commit it.
3. `npm run deploy` — builds the function and releases a new app version.
4. Install the app on the store (Dev Dashboard → the app → Install).
5. Shopify Admin → **Settings → Checkout → Checkout rules** → **Add rule** →
   pick **B2B checkout guard** → **Turn on**.

## Before turning it on, test

- Approved account: checkout from the Next.js app → pays normally.
- Same account: click "Log out" on Shopify's checkout → checkout is blocked.
- Pending account: blocked.
- A quote: send a draft order invoice to an approved customer and pay it.
  If Shopify treats the invoice checkout as a guest, the guard blocks it — in
  that case turn the rule off and adjust the function before relying on it.

The rule can be turned off from Checkout rules at any time without a redeploy.

## Tests

`npm test` builds the function to Wasm and runs it against
`extensions/b2b-checkout-guard/tests/fixtures/*.json`.
