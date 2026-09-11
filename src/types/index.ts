// ─── Shopify Types ───────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyPrice;
  compareAtPrice: ShopifyPrice | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  priceRange: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
  variants: { nodes: ShopifyProductVariant[] };
  options: { name: string; values: string[] }[];
  tags: string[];
  vendor: string;
  availableForSale: boolean;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    nodes: ShopifyProduct[];
    pageInfo?: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyPrice;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
  };
  cost: {
    totalAmount: ShopifyPrice;
  };
}

export interface ShopifyCartAttribute {
  key: string;
  value: string | null;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  attributes: ShopifyCartAttribute[];
  buyerIdentity: {
    email: string | null;
    countryCode: string | null;
    customer: { id: string; email: string } | null;
  } | null;
  lines: { nodes: ShopifyCartLine[] };
  cost: {
    subtotalAmount: ShopifyPrice;
    totalAmount: ShopifyPrice;
    totalTaxAmount: ShopifyPrice | null;
  };
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface B2BApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessType: string;
  taxId: string;
  website: string;
  message: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export interface CustomerSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  approved: boolean;
  b2bStatus: string | null;
  accessToken: string;
  expiresAt: string;
}

// ─── Cart Store Types ─────────────────────────────────────────────────────────

export interface CartState {
  cart: ShopifyCart | null;
  isOpen: boolean;
  /** Reserved for cart-wide operations (currently only checkout). */
  isLoading: boolean;
  /**
   * In-flight line operations, keyed by variant id (adds) or line id
   * (updates/removals) so a single row can spin without disabling the rest.
   */
  pending: Record<string, boolean>;
  /** Resolves to whether the line was added; surfaces its own error toast. */
  addItem: (
    variantId: string,
    quantity: number,
    options?: { label?: string; silent?: boolean }
  ) => Promise<boolean>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  fetchCart: (cartId: string) => Promise<void>;
  /** Rehydrates the cart from the id persisted in localStorage. */
  hydrate: () => Promise<void>;
  /** Attaches the buyer, stamps a checkout ref, and returns the Shopify checkout URL. */
  startCheckout: () => Promise<{ checkoutUrl: string; ref: string }>;
}

// ─── Quote Types ──────────────────────────────────────────────────────────────

export interface QuoteItem {
  variantId: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  productHandle: string;
  image: string | null;
  price: string;
  currencyCode: string;
  quantity: number;
}

export interface QuoteState {
  items: QuoteItem[];
  isOpen: boolean;
  addItem: (item: Omit<QuoteItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearQuote: () => void;
  openQuote: () => void;
  closeQuote: () => void;
  totalItems: () => number;
}

// ─── Checkout Types ───────────────────────────────────────────────────────────

/** What we persist locally while the buyer is away on Shopify's checkout. */
export interface PendingCheckout {
  ref: string;
  cartId: string;
  startedAt: string;
}

export interface CheckoutOrderLineItem {
  title: string;
  quantity: number;
  variant: {
    title: string | null;
    price: ShopifyPrice;
    image: { url: string; altText: string | null } | null;
  } | null;
}

export interface CheckoutOrder {
  id: string;
  orderNumber: number;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  statusUrl: string;
  currentSubtotalPrice: ShopifyPrice;
  currentTotalShippingPrice: ShopifyPrice;
  currentTotalTax: ShopifyPrice;
  currentTotalPrice: ShopifyPrice;
  shippingAddress: {
    firstName: string | null;
    lastName: string | null;
    address1: string | null;
    city: string | null;
    province: string | null;
    zip: string | null;
    country: string | null;
  } | null;
  lineItems: { nodes: CheckoutOrderLineItem[] };
}
