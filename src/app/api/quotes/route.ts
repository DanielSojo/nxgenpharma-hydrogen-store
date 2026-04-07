import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { shopifyAdminRequest } from '@/lib/shopify/admin';

// GET /api/quotes — fetch all draft orders for logged in customer
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customerId = (session.user as any).id;
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID not found' }, { status: 400 });
  }

  // Only fetch if Admin API is configured
  const hasAdminAccess =
    (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) ||
    process.env.SHOPIFY_ADMIN_TOKEN;

  if (!hasAdminAccess) {
    return NextResponse.json({ quotes: [] });
  }

  try {
    const numericCustomerId = customerId.includes('gid://')
      ? customerId.split('/').pop()
      : customerId;

    // Use REST API to fetch draft orders for this customer
    const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';
    let responseJson: any;

    if (process.env.SHOPIFY_ADMIN_CLIENT_ID && process.env.SHOPIFY_ADMIN_CLIENT_SECRET) {
      const { shopifyAdminRestRequest } = await import('@/lib/shopify/admin');
      responseJson = await shopifyAdminRestRequest(
        `draft_orders.json?customer_id=${numericCustomerId}&status=open&limit=50`
      );
    } else {
      const response = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/draft_orders.json?customer_id=${numericCustomerId}&status=open&limit=50`,
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
          },
        }
      );
      responseJson = await response.json();
    }

    const draftOrders = responseJson?.draft_orders ?? [];

    console.log(`[Quotes] Total draft orders returned: ${draftOrders.length}, filtering for customer ${numericCustomerId}`);

    // Filter by customer ID AND b2b-quote tag
    // Double-filter in case Shopify REST ignores customer_id param
    const quotes = draftOrders
      .filter((order: any) => {
        const orderCustomerId = String(order.customer?.id ?? '');
        const matchesCustomer = orderCustomerId === String(numericCustomerId);
        const isQuote = order.tags?.includes('b2b-quote');
        return matchesCustomer && isQuote;
      })
      .map((order: any) => ({
        id: order.id,
        name: order.name,
        status: order.status,
        totalPrice: order.total_price,
        currencyCode: order.currency,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        lineItemsCount: order.line_items?.length ?? 0,
        // Only expose customer notes, not admin info
        note: (order.note ?? '')
          .split('\n')
          .filter((line: string) =>
            line.startsWith('Customer Notes:')
          )
          .join('\n')
          .replace('Customer Notes: ', '')
          .trim(),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Quotes fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
