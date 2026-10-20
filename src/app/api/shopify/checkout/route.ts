import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCart, updateCartAttributes, updateCartBuyerIdentity } from '@/lib/shopify';
import {
  CHECKOUT_REF_ATTRIBUTE,
  RETURN_URL_ATTRIBUTE,
  buildReturnUrl,
  createCheckoutRef,
} from '@/lib/checkout';


function hostOf(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).host.toLowerCase();
  } catch {
    return null;
  }
}

/** True when Shopify's checkout URL points back at this Next.js app. */
function isSelfHosted(checkoutUrl: string, req: NextRequest) {
  const checkoutHost = hostOf(checkoutUrl);
  if (!checkoutHost) return false;

  const appHosts = new Set(
    [req.headers.get('host'), hostOf(process.env.NEXT_PUBLIC_SITE_URL)]
      .map((host) => host?.toLowerCase())
      .filter(Boolean) as string[]
  );

  return appHosts.has(checkoutHost);
}

/**
 * Prepares a cart for Shopify's hosted checkout:
 *   1. attaches the signed-in B2B customer (so checkout is pre-filled and the
 *      order lands on their account),
 *   2. stamps a unique `checkout_ref` attribute that survives onto the order,
 *   3. hands back the Shopify `checkoutUrl` for the browser to navigate to.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as
    | { id?: string; email?: string | null; accessToken?: string; approved?: boolean }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Checkout is gated behind B2B approval, same as the rest of the store.
  if (user.approved !== true) {
    return NextResponse.json({ error: 'Your account is not approved for ordering yet.' }, { status: 403 });
  }

  // Without a customer token the cart can't be tied to this account, and the
  // checkout would open as a guest checkout anyone could complete.
  if (!user.accessToken || !user.id) {
    return NextResponse.json(
      { error: 'Your session has expired. Please sign in again.' },
      { status: 401 }
    );
  }

  let cartId: string | undefined;
  try {
    ({ cartId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!cartId) {
    return NextResponse.json({ error: 'Missing cartId' }, { status: 400 });
  }

  try {
    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (cart.totalQuantity === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    // A cart already bound to another customer isn't this buyer's to check out.
    const boundCustomerId = cart.buyerIdentity?.customer?.id;
    if (boundCustomerId && boundCustomerId !== user.id) {
      console.warn(`[Checkout] Cart ${cartId} belongs to ${boundCustomerId}, requested by ${user.id}`);
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const ref = createCheckoutRef();

    // Keep any attributes already on the cart, replacing only the ones we own.
    const ours = [CHECKOUT_REF_ATTRIBUTE, RETURN_URL_ATTRIBUTE];
    const attributes = [
      ...(cart.attributes ?? [])
        .filter((attribute) => !ours.includes(attribute.key))
        .map((attribute) => ({ key: attribute.key, value: attribute.value ?? '' })),
      { key: CHECKOUT_REF_ATTRIBUTE, value: ref },
      // Rides through to the order so Shopify's thank-you page can link the
      // buyer straight back here (see README → "Returning from checkout").
      { key: RETURN_URL_ATTRIBUTE, value: buildReturnUrl(ref, req.nextUrl.origin) },
    ];

    await updateCartAttributes(cartId, attributes);

    // Buyer identity is mandatory: a cart that isn't bound to this approved
    // customer opens as a guest checkout, and the order lands on whatever email
    // the buyer types there — that is how unapproved customers got orders in.
    let updatedCart;
    try {
      updatedCart = await updateCartBuyerIdentity(cartId, {
        email: user.email ?? undefined,
        customerAccessToken: user.accessToken,
      });
    } catch (error) {
      console.warn('[Checkout] Could not attach buyer identity:', error);
    }

    if (updatedCart?.buyerIdentity?.customer?.id !== user.id) {
      console.warn(`[Checkout] Refused ref=${ref} for ${user.email} (${user.id}): buyer identity not attached`);
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Shopify orders carry the ref but not who started the checkout; this line
    // is the only record tying the two together.
    console.info(`[Checkout] Started ref=${ref} cart=${cartId} customer=${user.id} email=${user.email}`);

    const { checkoutUrl } = updatedCart;

    // Shopify builds checkoutUrl on the store's *primary domain*. If that domain
    // is also where this app is served, the buyer lands on our own 404 instead
    // of Shopify's checkout. Fail loudly here rather than mid-purchase.
    if (isSelfHosted(checkoutUrl, req)) {
      console.error(
        `[Checkout] Shopify's primary domain resolves to this app (${checkoutUrl}). ` +
          "Set a Shopify-served primary domain in Shopify Admin → Settings → Domains."
      );
      return NextResponse.json(
        { error: 'Checkout is misconfigured. Please contact support.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ checkoutUrl, ref });
  } catch (error) {
    console.error('[Checkout] Failed to prepare checkout:', error);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
