import { NextRequest, NextResponse } from 'next/server';
import { shopifyClient } from '@/lib/shopify/client';
import { CUSTOMER_RESET_BY_URL } from '@/lib/shopify/queries';
import { z } from 'zod';

// POST /api/auth/reset — resets password using Shopify reset URL
export async function POST(req: NextRequest) {
  try {
    const { resetUrl, password } = await req.json();

    z.string().url().parse(resetUrl);
    z.string().min(8, 'Password must be at least 8 characters').parse(password);

    const { data } = await shopifyClient.request(CUSTOMER_RESET_BY_URL, {
      variables: { resetUrl, password },
    });

    const errors = data?.customerResetByUrl?.customerUserErrors ?? [];
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
