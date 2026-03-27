import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify/client';
import { CUSTOMER_RECOVER, CUSTOMER_RESET_BY_URL } from '@/lib/shopify/queries';
import { z } from 'zod';

// POST /api/auth/recover — sends reset email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    z.string().email().parse(email);

    const { data } = await shopifyClient.request(CUSTOMER_RECOVER, {
      variables: { email },
    });

    const errors = data?.customerRecover?.customerUserErrors ?? [];

    // Always return success even if email not found (security best practice)
    // so we don't leak which emails are registered
    if (errors.length > 0) {
      console.warn('customerRecover error (not exposed to client):', errors[0].message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recover error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
