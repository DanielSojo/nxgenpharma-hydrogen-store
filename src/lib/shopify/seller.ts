import { getShopifyStoreDomain } from './env';

// ─── Admin GraphQL helper (supports OAuth client-credentials OR static token) ──
// Mirrors the dual-auth pattern used in auth.ts / quote route so this works
// whether the store uses SHOPIFY_ADMIN_CLIENT_ID/SECRET or SHOPIFY_ADMIN_TOKEN.
async function adminGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';
  const domain = getShopifyStoreDomain();
  const hasAdminOAuth =
    process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

  if (hasAdminOAuth) {
    const { shopifyAdminRequest } = await import('./admin');
    return shopifyAdminRequest<T>(query, variables);
  }

  if (!process.env.SHOPIFY_ADMIN_TOKEN) {
    throw new Error('Admin API not configured (set SHOPIFY_ADMIN_TOKEN or OAuth credentials)');
  }

  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'Admin API error');
  return json.data as T;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SellerOrder {
  id: string;
  name: string;
  processedAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  subtotal: number;
  total: number;
  currencyCode: string;
  /** Seller profit on this order = subtotal * markup% (orders are stored at base price). */
  profit: number;
}

export interface SellerClinic {
  id: string;
  name: string;
  email: string | null;
  markup: number;
  b2bStatus: string | null;
  orders: SellerOrder[];
  totalProfit: number;
}

// ─── Phase 1: find the clinics assigned to this seller ──────────────────────────
// custom.seller is a customer_reference metafield; its `value` is the seller gid.
// Customer search can't reliably filter by metafield, so we paginate and match.

const FIND_CLINICS = `
  query FindSellerClinics($cursor: String) {
    customers(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        displayName
        email
        seller: metafield(namespace: "custom", key: "seller") { value }
        markup: metafield(namespace: "custom", key: "price_markup") { value }
        b2bStatus: metafield(namespace: "custom", key: "b2b_status") { value }
      }
    }
  }
`;

// ─── Phase 2: load a clinic's orders ────────────────────────────────────────────

const CLINIC_ORDERS = `
  query ClinicOrders($id: ID!) {
    customer(id: $id) {
      orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          displayFinancialStatus
          displayFulfillmentStatus
          subtotalPriceSet { shopMoney { amount currencyCode } }
          totalPriceSet { shopMoney { amount currencyCode } }
        }
      }
    }
  }
`;

/** Normalize a customer id to the Admin gid form `gid://shopify/Customer/<n>`. */
function toCustomerGid(id: string): string {
  if (id.startsWith('gid://')) return id;
  return `gid://shopify/Customer/${id}`;
}

/**
 * Returns the clinics assigned to `sellerId` via the clinic's custom.seller
 * metafield, each with their orders and the seller's profit per order.
 */
export async function getSellerClinicsWithOrders(sellerId: string): Promise<SellerClinic[]> {
  const sellerGid = toCustomerGid(sellerId);

  // Phase 1 — collect this seller's clinics (paginate all customers).
  const clinics: Array<{ id: string; name: string; email: string | null; markup: number; b2bStatus: string | null }> = [];
  let cursor: string | null = null;

  do {
    const data: any = await adminGraphQL<any>(FIND_CLINICS, { cursor });
    const conn: any = data?.customers;
    for (const node of conn?.nodes ?? []) {
      if (node?.seller?.value === sellerGid) {
        clinics.push({
          id: node.id,
          name: node.displayName || node.email || 'Unnamed clinic',
          email: node.email ?? null,
          markup: node.markup?.value ? parseFloat(node.markup.value) : 0,
          b2bStatus: node.b2bStatus?.value ?? null,
        });
      }
    }
    cursor = conn?.pageInfo?.hasNextPage ? conn.pageInfo.endCursor : null;
  } while (cursor);

  // Phase 2 — load orders for each clinic and compute profit.
  return Promise.all(
    clinics.map(async (clinic): Promise<SellerClinic> => {
      let orders: SellerOrder[] = [];
      try {
        const data = await adminGraphQL<any>(CLINIC_ORDERS, { id: clinic.id });
        orders = (data?.customer?.orders?.nodes ?? []).map((o: any): SellerOrder => {
          const subtotal = parseFloat(o.subtotalPriceSet?.shopMoney?.amount ?? '0');
          const total = parseFloat(o.totalPriceSet?.shopMoney?.amount ?? '0');
          return {
            id: o.id,
            name: o.name,
            processedAt: o.processedAt ?? null,
            financialStatus: o.displayFinancialStatus ?? null,
            fulfillmentStatus: o.displayFulfillmentStatus ?? null,
            subtotal,
            total,
            currencyCode: o.subtotalPriceSet?.shopMoney?.currencyCode ?? 'USD',
            profit: subtotal * (clinic.markup / 100),
          };
        });
      } catch (err) {
        console.warn(`[seller] Could not load orders for ${clinic.id}:`, err);
      }

      return {
        ...clinic,
        orders,
        totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
      };
    })
  );
}
