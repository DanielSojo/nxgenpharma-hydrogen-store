export function useCustomerPricing() {
  function calculatePrice(basePrice: string | number): number {
    return typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice;
  }

  function formatCalculatedPrice(basePrice: string | number, currencyCode = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(calculatePrice(basePrice));
  }

  return { calculatePrice, formatCalculatedPrice };
}
