interface SessionUserLike {
  id?: string | null;
}

function getNumericCustomerId(customerId: string | null | undefined) {
  if (!customerId) return null;
  return customerId.includes('gid://') ? customerId.split('/').pop() ?? null : customerId;
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
