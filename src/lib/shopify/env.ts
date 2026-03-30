export function getShopifyStoreDomain(): string {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;

  if (!rawDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN is not set');
  }

  return rawDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
