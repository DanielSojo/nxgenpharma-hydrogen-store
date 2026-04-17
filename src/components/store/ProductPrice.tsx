'use client';

import { useCustomerPricing } from "@/hooks/useCustomerPricing.hook";



interface ProductPriceProps {
  amount: string;
  currencyCode: string;
  compareAtAmount?: string | null;
  size?: 'sm' | 'lg';
}

export default function ProductPrice({
  amount,
  currencyCode,
  compareAtAmount,
  size = 'lg',
}: ProductPriceProps) {
  const { formatCalculatedPrice, calculatePrice } = useCustomerPricing();

  const priceClass = size === 'lg'
    ? 'text-2xl font-bold text-[#191b4e]'
    : 'text-base font-bold text-[#191b4e]';

  const hasDiscount =
    compareAtAmount &&
    calculatePrice(compareAtAmount) > calculatePrice(amount);

  return (
    <div className="flex items-baseline gap-3">
      <span className={priceClass}>
        {formatCalculatedPrice(amount, currencyCode)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-[#999] line-through">
          {formatCalculatedPrice(compareAtAmount!, currencyCode)}
        </span>
      )}
      <span className="text-xs text-[#3296d2] font-medium">/ unit</span>
    </div>
  );
}
