import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { shopifyClient } from '@/lib/shopify/client';
import { shopifyAdminRestRequest } from '@/lib/shopify/admin';

const GET_CUSTOMER_ORDER_DETAIL = `
  query GetCustomerOrderDetail($accessToken: String!, $first: Int!) {
    customer(customerAccessToken: $accessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          currentSubtotalPrice { amount currencyCode }
          currentTotalShippingPrice { amount currencyCode }
          currentTotalTax { amount currencyCode }
          currentTotalPrice { amount currencyCode }
          shippingAddress {
            firstName lastName address1
            city province zip country
          }
          lineItems(first: 50) {
            nodes {
              title
              quantity
              variant {
                title
                price { amount currencyCode }
                image { url altText }
              }
            }
          }
        }
      }
    }
  }
`;

function getNumericOrderId(orderId: string) {
  return typeof orderId === 'string' ? orderId.split('/').pop() ?? '' : '';
}

async function getAdminOrderDetails(orderId: string) {
  const numericOrderId = getNumericOrderId(orderId);

  if (!numericOrderId) {
    return { fulfillments: [], summary: null, shippingLines: [], discountCodes: [], note: null, tags: [] };
  }

  let responseJson: any = null;

  try {
    responseJson = await shopifyAdminRestRequest(`orders/${numericOrderId}.json`);
  } catch (error) {
    console.warn('[Order Detail] Admin order enrichment unavailable:', error);
    return { fulfillments: [], summary: null, shippingLines: [], discountCodes: [], note: null, tags: [] };
  }

  const adminOrder = responseJson?.order;
  if (!adminOrder) {
    return { fulfillments: [], summary: null, shippingLines: [], discountCodes: [], note: null, tags: [] };
  }

  const shippingLines = Array.isArray(adminOrder.shipping_lines)
    ? adminOrder.shipping_lines.map((line: any) => ({
        title: line.title,
        code: line.code,
        price: line.discounted_price ?? line.price ?? '0',
      }))
    : [];

  const discountCodes = Array.isArray(adminOrder.discount_codes)
    ? adminOrder.discount_codes.map((discount: any) => ({
        code: discount.code,
        amount: discount.amount,
        type: discount.type,
      }))
    : [];

  return {
    fulfillments: Array.isArray(adminOrder.fulfillments)
      ? adminOrder.fulfillments.map((fulfillment: any) => ({
          trackingCompany: fulfillment.tracking_company,
          trackingInfo: Array.isArray(fulfillment.tracking_numbers)
            ? fulfillment.tracking_numbers.map((number: string, index: number) => ({
                number,
                url: Array.isArray(fulfillment.tracking_urls) ? fulfillment.tracking_urls[index] : null,
              }))
            : [],
          status: fulfillment.shipment_status ?? fulfillment.status,
          createdAt: fulfillment.created_at,
          updatedAt: fulfillment.updated_at,
        }))
      : [],
    summary: {
      subtotal: adminOrder.current_subtotal_price ?? adminOrder.subtotal_price ?? '0',
      shipping:
        adminOrder.total_shipping_price_set?.shop_money?.amount ??
        shippingLines.reduce((sum: number, line: any) => sum + Number(line.price ?? 0), 0).toString(),
      tax: adminOrder.current_total_tax ?? adminOrder.total_tax ?? '0',
      discounts: adminOrder.current_total_discounts ?? adminOrder.total_discounts ?? '0',
      total: adminOrder.current_total_price ?? adminOrder.total_price ?? '0',
      currency:
        adminOrder.currency ??
        adminOrder.total_shipping_price_set?.shop_money?.currency_code ??
        'USD',
    },
    shippingLines,
    discountCodes,
    note: adminOrder.note ?? null,
    tags: typeof adminOrder.tags === 'string'
      ? adminOrder.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [],
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use auth() to get accessToken — never use getToken() in production
  // NextAuth v5 uses __Secure- cookie prefix which breaks getToken()
  const accessToken = (session.user as any).accessToken as string;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { data, errors } = await shopifyClient.request(GET_CUSTOMER_ORDER_DETAIL, {
      variables: { accessToken, first: 50 },
    });

    if (errors) {
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

    const orders = data?.customer?.orders?.nodes ?? [];
    const order = orders.find((item: any) => {
      const rawId = item.id ?? '';
      const tailId = typeof rawId === 'string' ? rawId.split('/').pop() : '';
      return tailId === id || String(item.orderNumber) === id;
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const adminDetails = await getAdminOrderDetails(order.id);

    return NextResponse.json({
      order: {
        ...order,
        fulfillments: adminDetails.fulfillments,
        summary: adminDetails.summary,
        shippingLines: adminDetails.shippingLines,
        discountCodes: adminDetails.discountCodes,
        note: adminDetails.note,
        tags: adminDetails.tags,
      },
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
