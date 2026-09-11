# NexGen Pharma — B2B Storefront

A fully custom Next.js 15 B2B storefront powered by Shopify Storefront API.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth v5** — customer authentication via Shopify
- **Zustand** — cart state management
- **Shopify Storefront API** — products, collections, cart, checkout
- **Shopify Admin API** — customer approval/tagging

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Custom B2B login page
│   │   ├── apply/          # B2B application form
│   │   └── pending/        # Awaiting approval screen
│   ├── (store)/
│   │   ├── page.tsx        # Homepage
│   │   ├── products/[handle]/
│   │   └── collections/[handle]/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── apply/          # Application submit + approve/decline
│       └── shopify/cart/   # Cart operations
├── lib/
│   ├── shopify/            # API client, queries, mutations
│   ├── auth.ts             # NextAuth config
│   └── utils.ts
├── components/
│   ├── layout/Header.tsx
│   └── store/              # ProductCard, CartDrawer, AddToCartButton
├── store/cart.ts           # Zustand cart store
├── types/index.ts
└── middleware.ts           # Auth gate — redirects unauthenticated users
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_storefront_public_token
SHOPIFY_ADMIN_TOKEN=your_admin_api_token
NEXTAUTH_SECRET=your_random_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000
```

### 3. Get your Shopify tokens

#### Storefront API Token
1. Shopify Admin → Settings → Apps → Develop apps
2. Create app → Configure Storefront API scopes
3. Enable: `unauthenticated_read_product_listings`, `unauthenticated_read_collection_listings`, `unauthenticated_write_checkouts`
4. Copy the **Storefront API access token**

#### Admin API Token
1. Same app → Configure Admin API scopes
2. Enable: `read_customers`, `write_customers`
3. Copy the **Admin API access token**

### 4. Run

```bash
npm run dev
```

---

## B2B Flow

### How it works

1. **Visitor hits any page** → middleware redirects to `/login`
2. **No account?** → Click "Apply for an account" → `/apply`
3. **Application submitted** → Customer created in Shopify with tag `b2b-pending`,
   using the password the applicant chose on the form
4. **You review** in Shopify Admin → Customers → find them → add tag `b2b-approved`
5. **Customer logs in** with the email and password from their application →
   middleware checks for `b2b-approved` tag → grants access
6. **Not yet approved** → redirected to `/pending` page

Applicants set their own password during the application, so there is no
activation link to send. `/forgot-password` remains available if they forget it.

### Approving customers (Shopify Admin)

1. Go to **Shopify Admin → Customers**
2. Find the applicant (they'll have the `b2b-pending` tag)
3. Add tag: `b2b-approved`
4. Remove tag: `b2b-pending`
5. Let them know they're approved — they sign in with the password they set
   when applying, so no reset or invite email is required

### Optional: Approve via API

```bash
curl -X PATCH https://your-site.com/api/apply \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_SECRET_KEY" \
  -d '{"customerId": "gid://shopify/Customer/123", "action": "approve"}'
```

---

## Checkout

The cart lives in Shopify (Storefront Cart API) and payment happens on Shopify's
hosted checkout. The flow:

1. Buyer adds items — `POST /api/shopify/cart` creates/updates a Shopify cart,
   and the cart id is kept in `localStorage` under `cartId`.
2. Buyer clicks **Checkout** — `POST /api/shopify/checkout` attaches the
   signed-in B2B customer to the cart (`cartBuyerIdentityUpdate`, so checkout is
   pre-filled and the order files under their account) and stamps two cart
   attributes:
   - `checkout_ref` — a unique id for this checkout attempt
   - `return_url` — where Shopify should send the buyer afterwards
3. The browser navigates to the cart's `checkoutUrl` on the Shopify domain.
4. After payment the buyer returns to `/checkout/success`, which polls
   `GET /api/orders/lookup` until the matching order appears on their account,
   then clears the cart and renders the confirmation.

Cart attributes carry through to the order, so the success page matches on
`checkout_ref`. If that attribute doesn't survive (some express payment paths),
it falls back to the newest order processed since checkout began.

The cart is **only** cleared once Shopify confirms the order — an abandoned
checkout leaves it intact.

### Required: a Shopify-served checkout domain

Shopify builds `checkoutUrl` on the store's **primary domain**. In a headless
setup that domain must *not* be the one serving this Next.js app — otherwise the
checkout link resolves to Vercel and the buyer gets this app's 404 page.

Shopify also 301-redirects any other store domain (including
`*.myshopify.com`) to the primary domain, so this cannot be worked around in
code by rewriting the host. It has to be fixed in **Shopify Admin → Settings →
Domains**:

- Give Shopify its own subdomain — e.g. `shop.nxgenpharma.com`, CNAME'd to
  `shops.myshopify.com` — and set it as the **primary** domain, or
- set the primary domain back to `<store>.myshopify.com`.

Either way, the host serving this app (`www.nxgenpharma.com`) must not be
Shopify's primary domain. A subdomain of the same registrable domain is the
better option: it keeps checkout branded and cookies on the same site.

`POST /api/shopify/checkout` guards against this — if Shopify hands back a
checkout URL pointing at this app's own host, it returns a 502 and logs the
misconfiguration instead of sending the buyer to a dead link.

### Returning from checkout

Shopify's hosted thank-you page cannot redirect off-domain on its own, so the
return trip is configured store-side. In **Shopify Admin → Settings → Checkout →
Order status page → Additional scripts**, add:

```html
<script>
  var returnUrl = {{ checkout.attributes.return_url | json }};
  if (returnUrl) {
    document.write(
      '<a href="' + returnUrl + '" style="display:inline-block;padding:12px 24px;' +
      'border-radius:999px;background:#1d4ed8;color:#fff;font-weight:700;' +
      'text-decoration:none">Back to NexGen Pharma</a>'
    );
  }
</script>
```

Swap `document.write(...)` for `window.location.replace(returnUrl)` if you'd
rather skip Shopify's thank-you page entirely. On Shopify Plus, the same thing
can be done with a post-purchase redirect in the checkout profile.

This step is a convenience, not a requirement: `/checkout/success` also reads the
pending checkout from `localStorage`, so a buyer who simply navigates back to the
site still gets their confirmation.

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard.

### Update NEXTAUTH_URL

Set `NEXTAUTH_URL` to your production domain:
```env
NEXTAUTH_URL=https://nxgenpharma.com
```

---

## Customization

### Login background image
Place your image at `public/login-bg.jpg` — it will appear on the left panel of the login page.

### Logo
Replace the SVG wave logo in `src/app/(auth)/login/page.tsx` and `src/components/layout/Header.tsx` with your actual logo.

### Colors
Edit `tailwind.config.js` to change brand colors:
```js
brand: {
  blue: '#2b7fff',   // Primary action color
  dark: '#0a0a0a',   // Dark background
  cream: '#f0ece4',  // Login panel background
}
```
