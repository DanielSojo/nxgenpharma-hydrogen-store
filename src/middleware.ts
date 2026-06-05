import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    return NextResponse.next();
  }

  // Intercept Shopify reset URL → redirect to custom page
  if (pathname.startsWith('/account/reset')) {
    const resetUrl = `https://${getShopifyStoreDomain()}${pathname}${req.nextUrl.search}`;
    const newUrl = new URL('/reset-password', req.url);
    newUrl.searchParams.set('url', resetUrl);
    return NextResponse.redirect(newUrl);
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const user = req.auth?.user as
    | {
        approved?: boolean;
        b2bStatus?: string | null;
      }
    | undefined;

  // Not logged in → redirect to login
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Refused → redirect to /refused
  if (user?.b2bStatus === 'b2b-refused' && !pathname.startsWith('/refused')) {
    return NextResponse.redirect(new URL('/refused', req.url));
  }

  // Not approved (pending or no status) → redirect to /pending
  if (user?.approved !== true && !pathname.startsWith('/pending')) {
    return NextResponse.redirect(new URL('/pending', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)',
  ],
};
