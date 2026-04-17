// ─── Fragments ────────────────────────────────────────────────────────────────

export const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

export const PRICE_FRAGMENT = `
  fragment PriceFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const PRODUCT_CARD_FRAGMENT = `
  fragment ProductCardFragment on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage { ...ImageFragment }
    priceRange {
      minVariantPrice { ...PriceFragment }
      maxVariantPrice { ...PriceFragment }
    }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        price { ...PriceFragment }
        compareAtPrice { ...PriceFragment }
        selectedOptions { name value }
        image { ...ImageFragment }
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}
`;

// ─── Products ─────────────────────────────────────────────────────────────────

export const GET_PRODUCTS = `
  query GetProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCardFragment }
      pageInfo { hasNextPage endCursor }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      tags
      vendor
      featuredImage { ...ImageFragment }
      images(first: 10) { nodes { ...ImageFragment } }
      priceRange {
        minVariantPrice { ...PriceFragment }
        maxVariantPrice { ...PriceFragment }
      }
      options { name values }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price { ...PriceFragment }
          compareAtPrice { ...PriceFragment }
          selectedOptions { name value }
          image { ...ImageFragment }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}
`;

// ─── Collections ──────────────────────────────────────────────────────────────

export const GET_COLLECTIONS = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image { ...ImageFragment }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle($handle: String!, $first: Int!, $after: String) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      image { ...ImageFragment }
      products(first: $first, after: $after) {
        nodes { ...ProductCardFragment }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { ...PriceFragment }
            product {
              title
              handle
              featuredImage { ...ImageFragment }
            }
          }
        }
        cost {
          totalAmount { ...PriceFragment }
        }
      }
    }
    cost {
      subtotalAmount { ...PriceFragment }
      totalAmount { ...PriceFragment }
      totalTaxAmount { ...PriceFragment }
    }
  }
  ${IMAGE_FRAGMENT}
  ${PRICE_FRAGMENT}
`;

export const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFragment }
  }
  ${CART_FRAGMENT}
`;

// ─── Customer Auth ────────────────────────────────────────────────────────────

export const CUSTOMER_LOGIN = `
  mutation CustomerLogin($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;

export const GET_CUSTOMER = `
  query GetCustomer($accessToken: String!) {
    customer(customerAccessToken: $accessToken) {
      id
      email
      firstName
      lastName
      metafield(namespace: "custom", key: "b2b_status") {
        value
      }
    }
  }
`;

export const GET_CUSTOMER_TAGS = `
  query GetCustomerTags($accessToken: String!) {
    customer(customerAccessToken: $accessToken) {
      tags
    }
  }
`;

// ─── Password Recovery ────────────────────────────────────────────────────────

export const CUSTOMER_RECOVER = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        message
      }
    }
  }
`;

export const CUSTOMER_RESET = `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;

export const CUSTOMER_RESET_BY_URL = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;

// ─── Draft Orders ─────────────────────────────────────────────────────────────

export const CREATE_DRAFT_ORDER = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
        status
        totalPrice
        customer {
          id
          email
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ─── Customer Orders ──────────────────────────────────────────────────────────

export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders($accessToken: String!, $first: Int!, $after: String) {
    customer(customerAccessToken: $accessToken) {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          orderNumber
          processedAt
          financialStatus
          fulfillmentStatus
          currentSubtotalPrice {
            amount
            currencyCode
          }
          currentTotalShippingPrice {
            amount
            currencyCode
          }
          currentTotalTax {
            amount
            currencyCode
          }
          currentTotalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              variant {
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
