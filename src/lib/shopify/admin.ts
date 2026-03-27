type AdminTokenResponse = {
  access_token: string;
  scope: string;
  expires_in: number;
};

// Cache the token in memory to avoid requesting a new one on every API call
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getShopifyAdminAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      'Missing Shopify Admin OAuth credentials. Set SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET in .env.local'
    );
  }

  const url = `https://${domain}/admin/oauth/access_token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Shopify Admin token: ${res.status} ${text}`);
  }

  const data = (await res.json()) as AdminTokenResponse;

  // Cache it
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return data.access_token;
}

// Helper to make Admin API calls — automatically gets token
export async function shopifyAdminRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = await getShopifyAdminAccessToken();
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';

  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`Admin API error: ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// Helper for REST Admin API calls
export async function shopifyAdminRestRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getShopifyAdminAccessToken();
  const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? '2025-04';

  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${apiVersion}/${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
        ...options.headers,
      },
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(json.errors ?? json));
  }

  return json;
}
