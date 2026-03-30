export function getShopifyStoreDomain(): string {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!rawDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN is not set');
  }

  return rawDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export function getShopifyEnvDebugInfo() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const normalizedDomain = rawDomain
    ? rawDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    : null;

  return {
    nodeEnv: process.env.NODE_ENV ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    shopifyStoreDomainPresent: Boolean(rawDomain),
    shopifyStoreDomainRaw: rawDomain ?? null,
    shopifyStoreDomainNormalized: normalizedDomain,
    storefrontTokenPresent: Boolean(process.env.SHOPIFY_STOREFRONT_TOKEN),
    storefrontTokenLength: process.env.SHOPIFY_STOREFRONT_TOKEN?.length ?? 0,
    nextAuthSecretPresent: Boolean(process.env.NEXTAUTH_SECRET),
    authSecretPresent: Boolean(process.env.AUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
    authUrl: process.env.AUTH_URL ?? null,
  };
}
