import { createStorefrontApiClient } from '@shopify/storefront-api-client';

if (!process.env.SHOPIFY_STORE_DOMAIN) throw new Error('SHOPIFY_STORE_DOMAIN is not set');
if (!process.env.SHOPIFY_STOREFRONT_TOKEN) throw new Error('SHOPIFY_STOREFRONT_TOKEN is not set');

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-04',
  publicAccessToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
});

// Admin API client for approving/declining applications
export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) throw new Error(`Admin API error: ${response.statusText}`);
  const json = await response.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}
