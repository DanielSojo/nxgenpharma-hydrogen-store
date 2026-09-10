import { NextResponse } from 'next/server';

// Serves PDFs stored in Shopify Files (admin → Content → Files) under our own
// domain, e.g. https://www.nxgenpharma.com/1.pdf. Root-level "*.pdf" requests
// are rewritten here by next.config.mjs; the Shopify CDN origin is never
// exposed to the browser, and a missing file gets our own 404 rather than
// Shopify's branded error page.

const SHOPIFY_FILES_CDN =
  'https://cdn.shopify.com/s/files/1/0701/2551/9035/files';

/** Filenames we're willing to forward — no paths, no traversal, PDFs only. */
const ALLOWED_NAME = /^[A-Za-z0-9._-]+\.pdf$/;

/** Standalone 404 — these URLs are shared directly, so they get a real page. */
function fileNotFound() {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Document not found — NXGEN Pharma</title>
    <style>
      body {
        margin: 0; min-height: 100vh; display: flex; align-items: center;
        justify-content: center; background: #fff; color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; padding: 24px;
      }
      h1 { font-size: 20px; margin: 0 0 8px; }
      p { color: #64748b; margin: 0 0 20px; font-size: 15px; }
      a { color: #0f172a; font-size: 15px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Document not found</h1>
      <p>This document isn&rsquo;t available. Check the link and try again.</p>
      <a href="/">Go to nxgenpharma.com</a>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!ALLOWED_NAME.test(name) || name.includes('..')) return fileNotFound();

  let upstream: Response;
  try {
    upstream = await fetch(`${SHOPIFY_FILES_CDN}/${name}`, {
      // Shopify serves these with a long max-age; cache at our edge too.
      next: { revalidate: 3600 },
    });
  } catch (error) {
    console.error(`Shopify Files fetch failed for ${name}:`, error);
    return new NextResponse('Unable to load this file right now.', {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Anything but a hit (including Shopify's own 404 page) becomes our 404.
  if (!upstream.ok) return fileNotFound();

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
