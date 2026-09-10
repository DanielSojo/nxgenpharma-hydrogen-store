import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCustomerOrdersForCheckout } from '@/lib/shopify';
import { CHECKOUT_REF_ATTRIBUTE } from '@/lib/checkout';

// Tolerance for clock skew between this server and Shopify when falling back to
// a "processed after checkout started" match.
const CLOCK_SKEW_MS = 60_000;

function matchesRef(order: any, ref: string) {
  return (order.customAttributes ?? []).some(
    (attribute: { key: string; value: string | null }) =>
      attribute.key === CHECKOUT_REF_ATTRIBUTE && attribute.value === ref
  );
}

/**
 * Resolves the order a buyer just paid for, given the `checkout_ref` we stamped
 * on their cart. Shopify's hosted checkout can't hand us an order id on return,
 * so the success page polls this until the order shows up on the account.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  const ref = req.nextUrl.searchParams.get('ref');
  const since = req.nextUrl.searchParams.get('since');

  if (!ref && !since) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
  }

  try {
    const orders = await getCustomerOrdersForCheckout(accessToken, 10);

    // Preferred match: the cart attribute rode through to the order.
    let order = ref ? orders.find((candidate) => matchesRef(candidate, ref)) : undefined;

    // Fallback: the newest order processed since checkout began. Covers stores
    // where cart attributes don't propagate (e.g. Shop Pay express lanes).
    if (!order && since) {
      const startedAt = Date.parse(since);
      if (!Number.isNaN(startedAt)) {
        order = orders.find(
          (candidate) => Date.parse(candidate.processedAt) >= startedAt - CLOCK_SKEW_MS
        );
      }
    }

    if (!order) {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({ status: 'found', order });
  } catch (error) {
    console.error('[Checkout lookup] Failed:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
