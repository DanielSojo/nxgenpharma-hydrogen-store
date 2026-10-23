// Crea (una sola vez) el descuento automático "Volume pricing" en la tienda.
//
// El descuento tiene que crearlo la misma app que contiene la Function, así que
// se autentica con el client credentials grant de esa app (NexGen Checkout
// Guard), no con la app Admin que usa Next.
//
// Uso (desde shopify/):
//   npm run discount:create
// con shopify/.env:
//   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
//   FUNCTION_APP_CLIENT_SECRET=...   (Dev Dashboard → la app → Settings)

import fs from 'node:fs';

const TITLE = 'Volume pricing';
const API_VERSION = '2026-07';

const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
const clientSecret = process.env.FUNCTION_APP_CLIENT_SECRET?.trim();
const clientId = fs
  .readFileSync(new URL('../shopify.app.toml', import.meta.url), 'utf8')
  .match(/^client_id\s*=\s*"([^"]+)"/m)?.[1];

if (!domain || !clientSecret || !clientId) {
  console.error('Set SHOPIFY_STORE_DOMAIN and FUNCTION_APP_CLIENT_SECRET in shopify/.env');
  process.exit(1);
}

async function getAccessToken() {
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token request failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.scope?.split(',').includes('write_discounts')) {
    throw new Error(
      `The app has scopes "${json.scope}" but needs write_discounts. ` +
        'Run `npm run deploy` and approve the new permission in Admin → Apps.'
    );
  }
  return json.access_token;
}

async function admin(token, query, variables) {
  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Admin API error: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}

const token = await getAccessToken();

const { discountNodes } = await admin(
  token,
  `query($query: String!) {
    discountNodes(first: 10, query: $query) {
      nodes { id discount { ... on DiscountAutomaticApp { title status } } }
    }
  }`,
  { query: `title:"${TITLE}"` }
);
const existing = discountNodes.nodes.find((node) => node.discount?.title === TITLE);
if (existing) {
  console.log(`"${TITLE}" already exists (${existing.discount.status}): ${existing.id}`);
  process.exit(0);
}

const { shopifyFunctions } = await admin(
  token,
  `{ shopifyFunctions(first: 25) { nodes { id title apiType } } }`
);
// The app has one discount function; match the title too in case that changes.
const discountFunctions = shopifyFunctions.nodes.filter((node) => node.apiType === 'discount');
const fn =
  discountFunctions.find((node) => node.title === TITLE) ??
  (discountFunctions.length === 1 ? discountFunctions[0] : undefined);
if (!fn) {
  console.error('Volume pricing function not found. Run `npm run deploy` first. Functions found:');
  console.error(shopifyFunctions.nodes);
  process.exit(1);
}

const { discountAutomaticAppCreate } = await admin(
  token,
  `mutation($discount: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $discount) {
      automaticAppDiscount { discountId status }
      userErrors { field message }
    }
  }`,
  {
    discount: {
      title: TITLE,
      functionId: fn.id,
      discountClasses: ['PRODUCT'],
      startsAt: new Date().toISOString(),
    },
  }
);

if (discountAutomaticAppCreate.userErrors.length) {
  console.error('Shopify rejected the discount:', discountAutomaticAppCreate.userErrors);
  process.exit(1);
}

const created = discountAutomaticAppCreate.automaticAppDiscount;
console.log(`Created "${TITLE}" (${created.status}): ${created.discountId}`);
