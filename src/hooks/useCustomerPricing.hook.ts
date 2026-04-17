import { useSession } from 'next-auth/react';

export function useCustomerPricing() {
  const { data: session } = useSession();
  const markup: number = (session?.user as any)?.markup ?? 0;

  function calculatePrice(basePrice: string | number): number {
    const base = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
    return markup > 0 ? base * (1 + markup / 100) : base;
  }

  function formatCalculatedPrice(basePrice: string | number, currencyCode = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(calculatePrice(basePrice));
  }

  return { markup, calculatePrice, formatCalculatedPrice };
}