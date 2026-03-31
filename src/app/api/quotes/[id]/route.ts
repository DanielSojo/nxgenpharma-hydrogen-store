import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerId = (session.user as any).id;
  const draftOrderId = params.id;

  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';

  try {
    let responseJson: any;

    if (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) {
      const { shopifyAdminRestRequest } = await import('@/lib/shopify/admin');
      responseJson = await shopifyAdminRestRequest(
        `draft_orders/${draftOrderId}.json`
      );
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
      return NextResponse.json({ error: 'Admin API not configured' }, { status: 503 });
    }

    const order = responseJson?.draft_order;
    if (!order) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Security: verify this draft order belongs to the logged-in customer
    const numericCustomerId = customerId?.includes('gid://')
      ? customerId.split('/').pop()
      : customerId;

    if (String(order.customer?.id) !== String(numericCustomerId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch product images for line items using variantId from properties
    const { shopifyClient } = await import('@/lib/shopify/client');
    const lineItemsWithImages = await Promise.all(
      order.line_items.map(async (item: any) => {
        const variantIdProp = item.properties?.find((p: any) => p.name === 'variantId');
        const variantId = variantIdProp?.value;

        if (!variantId) return item;

        try {
          const { data } = await shopifyClient.request(`
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
          `, {
            variables: { id: `gid://shopify/ProductVariant/${variantId}` },
          });

          const image =
            data?.node?.image?.url ??
            data?.node?.product?.featuredImage?.url ??
            null;

          return { ...item, _image: image };
        } catch {
          return item;
        }
      })
    );

    // Strip admin-only info from note before returning to client
    const sanitizedNote = (order.note ?? '')
      .split('\n')
      .filter((line: string) =>
        !line.startsWith('Markup Applied:') &&
        !line.startsWith('Quote Number:') &&
        !line.startsWith('Requested by:')
      )
      .join('\n')
      .trim();

    // Strip sensitive properties before returning to client
    const HIDDEN_PROPERTIES = ['basePrice', 'markupApplied', 'variantId', 'productHandle'];

    const sanitizedLineItems = lineItemsWithImages.map((item: any) => ({
      ...item,
      properties: (item.properties ?? []).filter(
        (p: any) => !HIDDEN_PROPERTIES.includes(p.name)
      ),
      sku: undefined,
    }));

    return NextResponse.json({
      quote: {
        ...order,
        note: sanitizedNote,
        line_items: sanitizedLineItems,
      },
    });
  } catch (error) {
    console.error('Quote fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}