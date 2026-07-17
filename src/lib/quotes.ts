interface SessionUserLike {
  id?: string | null;
}

function getNumericCustomerId(customerId: string | null | undefined) {
  if (!customerId) return null;
  return customerId.includes('gid://') ? customerId.split('/').pop() ?? null : customerId;
}

// ─── Draft-order creation (shared by /api/quote and cart → quote) ──────────────

export interface DraftOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface DraftOrderShipping {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateDraftOrderInput {
  items: DraftOrderItemInput[];
  customer: { name: string; email: string };
  shipping?: DraftOrderShipping | null;
  notes?: string;
  quoteNumber: string;
  customerId?: string | null;
}

export interface CreatedDraftOrder {
  id: string; // gid://shopify/DraftOrder/<numeric>
  numericId: string;
  name: string;
  invoiceUrl: string;
  status: string;
  totalPrice: string;
}

export function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `Q${year}${month}${day}-${random}`;
}

export function hasAdminAccess(): boolean {
  return Boolean(
    (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) ||
      process.env.SHOPIFY_ADMIN_TOKEN
  );
}

/** Fetch the customer's price markup metafield (for admin reference on the draft order). */
export async function getCustomerMarkup(customerId: string): Promise<number> {
  try {
    const query = `
      query GetCustomerMarkup($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "custom", key: "price_markup") {
            value
          }
        }
      }
    `;

    let data: any;
    const hasAdminOAuth =
      process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

    if (hasAdminOAuth) {
      const { shopifyAdminRequest } = await import('@/lib/shopify/admin');
      data = await shopifyAdminRequest<any>(query, { id: customerId });
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01'}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify({ query, variables: { id: customerId } }),
        }
      );
      const json = await response.json();
      data = json.data;
    }

    const value = data?.customer?.metafield?.value;
    const markup = value ? parseFloat(value) : 0;
    console.log(`[Quote] Customer markup: ${markup}%`);
    return markup;
  } catch (err) {
    console.warn('[Quote] Could not fetch markup:', err);
    return 0;
  }
}

/** Fetch the customer's default address to pre-fill the shipping address on a quote. */
export async function getCustomerDefaultShipping(
  customerId: string
): Promise<DraftOrderShipping | null> {
  try {
    const query = `
      query GetCustomerDefaultAddress($id: ID!) {
        customer(id: $id) {
          defaultAddress {
            address1
            city
            province
            zip
            country
          }
        }
      }
    `;

    let data: any;
    const hasAdminOAuth =
      process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

    if (hasAdminOAuth) {
      const { shopifyAdminRequest } = await import('@/lib/shopify/admin');
      data = await shopifyAdminRequest<any>(query, { id: customerId });
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01'}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
          },
          body: JSON.stringify({ query, variables: { id: customerId } }),
        }
      );
      const json = await response.json();
      data = json.data;
    }

    const addr = data?.customer?.defaultAddress;
    if (!addr?.address1) return null;

    return {
      address: addr.address1 ?? '',
      city: addr.city ?? '',
      state: addr.province ?? '',
      zip: addr.zip ?? '',
      country: addr.country ?? '',
    };
  } catch (err) {
    console.warn('[Quote] Could not fetch default address:', err);
    return null;
  }
}

/** Create a Shopify draft order tagged as a B2B quote. Returns null if the Admin API is not configured. */
export async function createShopifyDraftOrder(
  input: CreateDraftOrderInput
): Promise<CreatedDraftOrder | null> {
  const hasAdminOAuth =
    process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  const hasAdminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!hasAdminOAuth && !hasAdminToken) return null;

  const { items, customer, shipping, notes, quoteNumber, customerId } = input;

  // Fetch markup to note on draft order (for admin reference)
  let markup = 0;
  if (customerId) {
    markup = await getCustomerMarkup(customerId);
  }

  const numericCustomerId = getNumericCustomerId(customerId);

  // Use variant_id so Shopify shows real product images in Admin.
  // Base prices are stored — markup is only shown on the customer-facing quote page.
  const lineItems = items.map((item) => {
    const variantIdNumeric = item.variantId.includes('gid://')
      ? item.variantId.split('/').pop()
      : item.variantId;

    return {
      variant_id: variantIdNumeric,
      quantity: item.quantity,
    };
  });

  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2026-01';

  const restBody: Record<string, any> = {
    draft_order: {
      line_items: lineItems,
      note: [
        `Quote Number: ${quoteNumber}`,
        `Requested by: ${customer.name} (${customer.email})`,
        markup > 0 ? `Markup Applied: ${markup}%` : '',
        notes ? `Customer Notes: ${notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      tags: `b2b-quote,${quoteNumber}`,
      ...(shipping
        ? {
            shipping_address: {
              address1: shipping.address,
              city: shipping.city,
              province: shipping.state,
              zip: shipping.zip,
              country: shipping.country,
              first_name: customer.name.split(' ')[0] ?? '',
              last_name: customer.name.split(' ').slice(1).join(' ') ?? '',
            },
          }
        : {}),
      ...(numericCustomerId
        ? { customer: { id: numericCustomerId } }
        : { email: customer.email }),
    },
  };

  try {
    let responseJson: any;

    if (hasAdminOAuth) {
      const { shopifyAdminRestRequest } = await import('@/lib/shopify/admin');
      responseJson = await shopifyAdminRestRequest('draft_orders.json', {
        method: 'POST',
        body: JSON.stringify(restBody),
      });
    } else {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/draft_orders.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          },
          body: JSON.stringify(restBody),
        }
      );
      responseJson = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(responseJson));
    }

    const draft = responseJson?.draft_order;
    if (!draft) return null;

    console.log(`✅ Draft order: ${draft.name}`);

    return {
      id: `gid://shopify/DraftOrder/${draft.id}`,
      numericId: String(draft.id),
      name: draft.name,
      invoiceUrl: draft.invoice_url,
      status: draft.status,
      totalPrice: draft.total_price,
    };
  } catch (error) {
    console.error('Draft order creation failed:', error);
    return null;
  }
}

export async function fetchAuthorizedQuote(user: SessionUserLike, draftOrderId: string) {
  const customerId = getNumericCustomerId(user.id);
  if (!customerId) {
    return { error: 'Customer ID not found', status: 400 as const };
  }

  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';

  try {
    let responseJson: any;

    if (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) {
      const { shopifyAdminRestRequest } = await import('@/lib/shopify/admin');
      responseJson = await shopifyAdminRestRequest(`draft_orders/${draftOrderId}.json`);
    } else if (process.env.SHOPIFY_ADMIN_TOKEN) {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/draft_orders/${draftOrderId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          },
        }
      );
      responseJson = await response.json();
    } else {
      return { error: 'Admin API not configured', status: 503 as const };
    }

    const order = responseJson?.draft_order;
    if (!order) {
      return { error: 'Quote not found', status: 404 as const };
    }

    if (String(order.customer?.id) !== String(customerId)) {
      return { error: 'Unauthorized', status: 403 as const };
    }

    const { shopifyClient } = await import('@/lib/shopify/client');
    const lineItemsWithImages = await Promise.all(
      (order.line_items ?? []).map(async (item: any) => {
        const variantIdProp = item.properties?.find((p: any) => p.name === 'variantId');
        const variantId = variantIdProp?.value;

        if (!variantId) return item;

        try {
          const { data } = await shopifyClient.request(
            `
              query GetVariantImage($id: ID!) {
                node(id: $id) {
                  ... on ProductVariant {
                    image { url altText }
                    product {
                      featuredImage { url altText }
                    }
                  }
                }
              }
            `,
            {
              variables: { id: `gid://shopify/ProductVariant/${variantId}` },
            }
          );

          const image = data?.node?.image?.url ?? data?.node?.product?.featuredImage?.url ?? null;
          return { ...item, _image: image };
        } catch {
          return item;
        }
      })
    );

    const originalNote = order.note ?? '';
    const quoteNumberMatch = originalNote.match(/Quote Number: (Q\S+)/);
    const quoteNumber = quoteNumberMatch?.[1] ?? order.name;

    const customerNotes = originalNote
      .split('\n')
      .filter((line: string) => line.startsWith('Customer Notes:'))
      .join('\n')
      .replace('Customer Notes: ', '')
      .trim();

    const sanitizedNote = originalNote
      .split('\n')
      .filter(
        (line: string) =>
          !line.startsWith('Markup Applied:') &&
          !line.startsWith('Quote Number:') &&
          !line.startsWith('Requested by:')
      )
      .join('\n')
      .trim();

    const hiddenProperties = ['basePrice', 'markupApplied', 'variantId', 'productHandle'];
    const sanitizedLineItems = lineItemsWithImages.map((item: any) => ({
      ...item,
      properties: (item.properties ?? []).filter((p: any) => !hiddenProperties.includes(p.name)),
      sku: undefined,
    }));

    return {
      quote: {
        ...order,
        note: sanitizedNote,
        customerNotes,
        quoteNumber,
        line_items: sanitizedLineItems,
      },
    } as const;
  } catch (error) {
    console.error('Quote fetch error:', error);
    return { error: 'Failed to fetch quote', status: 500 as const };
  }
}
