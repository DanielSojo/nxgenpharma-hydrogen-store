import { shopifyClient } from './client';
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_CART,
  CUSTOMER_LOGIN,
  GET_CUSTOMER,
  GET_CUSTOMER_TAGS,
} from './queries';
import {
  CREATE_CART,
  ADD_CART_LINES,
  UPDATE_CART_LINES,
  REMOVE_CART_LINES,
} from './mutations';
import { getShopifyStoreDomain } from './env';
import type {
  ShopifyProduct,
  ShopifyCollection,
  ShopifyCart,
  CustomerSession,
} from '@/types';

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  first?: number;
  after?: string;
  sortKey?: string;
  reverse?: boolean;
}) {
  const { data } = await shopifyClient.request(GET_PRODUCTS, {
    variables: {
      first: options?.first ?? 20,
      after: options?.after,
      sortKey: options?.sortKey ?? 'BEST_SELLING',
      reverse: options?.reverse ?? false,
    },
  });
  return data?.products as {
    nodes: ShopifyProduct[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export async function getProductByHandle(handle: string) {
  const { data } = await shopifyClient.request(GET_PRODUCT_BY_HANDLE, {
    variables: { handle },
  });
  return data?.productByHandle as ShopifyProduct | null;
}

// ─── Collections ──────────────────────────────────────────────────────────────

export async function getCollections(first = 10) {
  const { data } = await shopifyClient.request(GET_COLLECTIONS, {
    variables: { first },
  });
  return data?.collections.nodes as ShopifyCollection[];
}

export async function getCollectionByHandle(handle: string, first = 24) {
  const { data } = await shopifyClient.request(GET_COLLECTION_BY_HANDLE, {
    variables: { handle, first },
  });
  return data?.collectionByHandle as ShopifyCollection | null;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getCart(cartId: string) {
  const { data } = await shopifyClient.request(GET_CART, {
    variables: { cartId },
  });
  return data?.cart as ShopifyCart | null;
}

export async function createCart(variantId?: string, quantity = 1) {
  const { data } = await shopifyClient.request(CREATE_CART, {
    variables: {
      lines: variantId ? [{ merchandiseId: variantId, quantity }] : [],
    },
  });
  return data?.cartCreate.cart as ShopifyCart;
}

export async function addCartLines(cartId: string, variantId: string, quantity: number) {
  const { data } = await shopifyClient.request(ADD_CART_LINES, {
    variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  });
  return data?.cartLinesAdd.cart as ShopifyCart;
}

export async function updateCartLines(cartId: string, lineId: string, quantity: number) {
  const { data } = await shopifyClient.request(UPDATE_CART_LINES, {
    variables: { cartId, lines: [{ id: lineId, quantity }] },
  });
  return data?.cartLinesUpdate.cart as ShopifyCart;
}

export async function removeCartLines(cartId: string, lineId: string) {
  const { data } = await shopifyClient.request(REMOVE_CART_LINES, {
    variables: { cartId, lineIds: [lineId] },
  });
  return data?.cartLinesRemove.cart as ShopifyCart;
}

// ─── Customer Auth ────────────────────────────────────────────────────────────

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ accessToken: string; expiresAt: string } | null> {
  const { data } = await shopifyClient.request(CUSTOMER_LOGIN, {
    variables: { input: { email, password } },
  });

  const result = data?.customerAccessTokenCreate;
  if (result?.customerUserErrors?.length > 0) {
    const firstError = result.customerUserErrors[0];
    console.error(
      '[Shopify login] customerAccessTokenCreate failed:',
      JSON.stringify(
        {
          code: firstError.code,
          message: firstError.message,
          storeDomain: getShopifyStoreDomain(),
          email: email.toLowerCase(),
        },
        null,
        2
      )
    );
    throw new Error(firstError.message);
  }

  return result?.customerAccessToken ?? null;
}

export async function getCustomer(accessToken: string): Promise<CustomerSession | null> {
  const { data, errors } = await shopifyClient.request(GET_CUSTOMER, {
    variables: { accessToken },
  });

  if (errors) {
    console.error('[getCustomer] GraphQL errors:', JSON.stringify(errors, null, 2));
    return null;
  }

  const customer = data?.customer;
  if (!customer) {
    console.error('[getCustomer] customer is null — token may be invalid or expired');
    return null;
  }

  // Read b2b_status from metafield (custom.b2b_status)
  const b2bStatus = customer.metafield?.value ?? null;
  const approved = b2bStatus === 'b2b-approved';

  console.log('[getCustomer] success:', customer.email, '| b2b_status:', b2bStatus);

  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    approved,
    b2bStatus,
    accessToken,
    expiresAt: '',
  };
}
