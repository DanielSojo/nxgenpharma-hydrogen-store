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

  const searchParams = req.nextUrl.searchParams;
  const firstParam = Number(searchParams.get('first'));
  const first = Number.isFinite(firstParam) ? Math.min(Math.max(firstParam, 1), 50) : 10;
  const after = searchParams.get('after') || null;

  // Get accessToken from JWT (server-side only — not exposed in session)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken as string;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  try {
    const { data, errors } = await shopifyClient.request(GET_CUSTOMER_ORDERS, {
      variables: { accessToken, first, after },
    });

    if (errors) {
      console.error('Orders fetch errors:', errors);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const orderConnection = data?.customer?.orders;
    const orders = (orderConnection?.nodes ?? []).sort(
      (a: any, b: any) =>
        new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
    );

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
      pageInfo: {
        hasNextPage: Boolean(orderConnection?.pageInfo?.hasNextPage),
        endCursor: orderConnection?.pageInfo?.endCursor ?? null,
      },
    });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
