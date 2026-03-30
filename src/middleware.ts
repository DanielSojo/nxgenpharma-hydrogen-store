import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getShopifyStoreDomain } from '@/lib/shopify/env';

const PUBLIC_PATHS = [
  '/login',
  '/apply',
  '/pending',
  '/refused',
  '/forgot-password',
  '/reset-password',
  '/account/reset',
  '/api/auth',
  '/api/apply',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Intercept Shopify reset URL → redirect to custom page
  if (pathname.startsWith('/account/reset')) {
    const resetUrl = `https://${getShopifyStoreDomain()}${pathname}${req.nextUrl.search}`;
    const newUrl = new URL('/reset-password', req.url);
    newUrl.searchParams.set('url', resetUrl);
    return NextResponse.redirect(newUrl);
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in → redirect to login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Refused → redirect to /refused
  if (token.b2bStatus === 'b2b-refused' && !pathname.startsWith('/refused')) {
    return NextResponse.redirect(new URL('/refused', req.url));
  }

  // Not approved (pending or no status) → redirect to /pending
  if (token.approved !== true && !pathname.startsWith('/pending')) {
    return NextResponse.redirect(new URL('/pending', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)',
  ],
};
