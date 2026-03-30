import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { getShopifyStoreDomain } from './env';

if (!process.env.SHOPIFY_STOREFRONT_TOKEN) throw new Error('SHOPIFY_STOREFRONT_TOKEN is not set');

const shopifyStoreDomain = getShopifyStoreDomain();

export const shopifyClient = createStorefrontApiClient({
  storeDomain: shopifyStoreDomain,
  apiVersion: '2025-04',
  publicAccessToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
});

// Admin API client for approving/declining applications
export async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(
    `https://${shopifyStoreDomain}/admin/api/2025-04/graphql.json`,
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
