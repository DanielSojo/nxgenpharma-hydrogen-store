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

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
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
  isLoading: boolean;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: (cartId: string) => Promise<void>;
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
  addItem: (item: Omit<QuoteItem, 'quantity'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearQuote: () => void;
  openQuote: () => void;
  closeQuote: () => void;
  totalItems: () => number;
}
