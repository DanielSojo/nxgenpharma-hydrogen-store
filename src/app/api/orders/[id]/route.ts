import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { shopifyClient } from '@/lib/shopify/client';

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

// Admin API query to get fulfillment + tracking
const GET_ORDER_FULFILLMENTS = `
  query GetOrderFulfillments($id: ID!) {
    order(id: $id) {
      fulfillments(first: 5) {
        trackingCompany
        trackingInfo(first: 5) {
          number
          url
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

async function getAdminFulfillments(orderId: string) {
  const adminUrl = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`;

  const res = await fetch(adminUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN!,
    },
    body: JSON.stringify({
      query: GET_ORDER_FULFILLMENTS,
      variables: { id: orderId }, // e.g. "gid://shopify/Order/123456"
    }),
  });

  const json = await res.json();
  return json?.data?.order?.fulfillments ?? [];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken as string;

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

    // Fetch tracking from Admin API using the full GID
    const fulfillments = await getAdminFulfillments(order.id);

    return NextResponse.json({ order: { ...order, fulfillments } });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}