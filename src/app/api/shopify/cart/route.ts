import { NextRequest, NextResponse } from 'next/server';
import {
  getCart,
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
} from '@/lib/shopify';

export async function GET(req: NextRequest) {
  const cartId = req.nextUrl.searchParams.get('cartId');
  if (!cartId) return NextResponse.json({ error: 'Missing cartId' }, { status: 400 });

  const cart = await getCart(cartId);
  if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, cartId, variantId, lineId, quantity } = body;

  try {
    let cart;

    switch (action) {
      case 'add':
        if (cartId) {
          cart = await addCartLines(cartId, variantId, quantity);
        } else {
          cart = await createCart(variantId, quantity);
        }
        break;
      case 'update':
        cart = await updateCartLines(cartId, lineId, quantity);
        break;
      case 'remove':
        cart = await removeCartLines(cartId, lineId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json({ error: 'Cart operation failed' }, { status: 500 });
  }
}
