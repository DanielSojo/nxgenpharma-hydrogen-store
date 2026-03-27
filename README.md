# NxGen Pharma — B2B Storefront

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
3. **Application submitted** → Customer created in Shopify with tag `b2b-pending`
4. **You review** in Shopify Admin → Customers → find them → add tag `b2b-approved`
5. **Customer logs in** → middleware checks for `b2b-approved` tag → grants access
6. **Not yet approved** → redirected to `/pending` page

### Approving customers (Shopify Admin)

1. Go to **Shopify Admin → Customers**
2. Find the applicant (they'll have the `b2b-pending` tag)
3. Add tag: `b2b-approved`
4. Remove tag: `b2b-pending`
5. Send them a password reset / account invite email

### Optional: Approve via API

```bash
curl -X PATCH https://your-site.com/api/apply \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_SECRET_KEY" \
  -d '{"customerId": "gid://shopify/Customer/123", "action": "approve"}'
```

---

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
