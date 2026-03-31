import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import { shopifyClient } from '@/lib/shopify/client';
import { GET_CUSTOMER_ORDERS } from '@/lib/shopify/queries';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get accessToken from JWT (server-side only — not exposed in session)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken as string;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const { data, errors } = await shopifyClient.request(GET_CUSTOMER_ORDERS, {
      variables: { accessToken, first: 20 },
    });

    if (errors) {
      console.error('Orders fetch errors:', errors);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const orders = data?.customer?.orders?.nodes ?? [];

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        processedAt: order.processedAt,
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        currentTotalPrice: order.currentTotalPrice,
        lineItemsCount: order.lineItems?.nodes?.length ?? 0,
      })),
    });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}