# NxGen Shopify app

Holds the Shopify Functions for the store: the checkout guard and volume
pricing. It is separate from the Next.js app: it is deployed to Shopify with the Shopify CLI, not to Vercel.

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

## volume-pricing

An automatic product discount (title **Volume pricing**). It lowers a cart
line's unit price to the tier its quantity reaches, read from the **variant's**
`custom.volume_pricing` metafield (per variant, since each one has its own
price):

```json
[{"min":1,"price":100},{"min":11,"price":90},{"min":21,"price":70}]
```

The variant's regular price must equal the first tier. Variants without the
metafield, or with one that doesn't parse, get no discount. Quantity counts per
line (variant); set `GROUP_BY_PRODUCT` in the function to count all variants of
a product together (each variant still uses its own tiers). Tier prices are in
the store currency.

The Next.js product page reads the same metafield for its tier table
(`src/lib/volume-pricing.ts`), but the price is Shopify's: the cart shows the
totals the Storefront API returns.

### Setup (once)

1. Shopify Admin → **Settings → Custom data → Variants** → add definition
   `custom.volume_pricing`, type **JSON**, with **Storefront API access** on.
2. Fill the metafield on each variant with volume pricing.
3. `npm run deploy`.
4. Create the automatic discount. It has to be created by this app (the one
   that owns the function), so `npm run discount:create` signs in as the app
   with the client credentials grant and runs `discountAutomaticAppCreate`.
   It needs `shopify/.env` (gitignored):

   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   FUNCTION_APP_CLIENT_SECRET=...   # Dev Dashboard → this app → Settings
   ```

   Running it again is safe: it stops if the discount already exists.
   (`shopify app dev` + GraphiQL also works, but only on development stores.)

   It then shows under **Discounts** in the Admin, where it can be paused.

## Tests

`npm test` runs every extension's tests: each function is built to Wasm and
run against its `tests/fixtures/*.json`. `volume-pricing` also has unit tests
for its logic (`tests/logic.test.js`).
