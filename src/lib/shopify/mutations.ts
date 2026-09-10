import { CART_FRAGMENT } from './queries';

export const CREATE_CART = `
  mutation CreateCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const ADD_CART_LINES = `
  mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const UPDATE_CART_LINES = `
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const REMOVE_CART_LINES = `
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

// Attaches the signed-in customer to the cart so Shopify checkout opens
// pre-authenticated and the resulting order is filed under their account.
export const CART_BUYER_IDENTITY_UPDATE = `
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

// Cart attributes carry through to the order as custom attributes, which is how
// the success page ties a completed checkout back to the cart that started it.
export const CART_ATTRIBUTES_UPDATE = `
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;
