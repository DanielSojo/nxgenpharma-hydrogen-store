'use client';

import { useQuoteStore } from '@/store/quote';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, Loader2, CheckCircle, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const quoteSchema = z.object({
  notes: z.string().optional(),
  expectedDelivery: z.string().optional(),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  shippingCity: z.string().min(1, 'City is required'),
  shippingState: z.string().min(1, 'State is required'),
  shippingZip: z.string().min(1, 'ZIP code is required'),
  shippingCountry: z.string().min(1, 'Country is required'),
});

type QuoteForm = z.infer<typeof quoteSchema>;

export default function QuotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, clearQuote } = useQuoteStore();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [draftOrderName, setDraftOrderName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteForm>({ resolver: zodResolver(quoteSchema) });

  useEffect(() => {
    if (items.length === 0 && !submitted) {
      router.push('/');
    }
  }, [items, submitted, router]);

  const onSubmit = async (formData: QuoteForm) => {
    setServerError('');

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        customer: {
          name: `${(session?.user as any)?.firstName ?? ''} ${(session?.user as any)?.lastName ?? ''}`.trim(),
          email: session?.user?.email,
        },
        shipping: {
          address: formData.shippingAddress,
          city: formData.shippingCity,
          state: formData.shippingState,
          zip: formData.shippingZip,
          country: formData.shippingCountry,
        },
        notes: formData.notes,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? 'Failed to submit quote. Please try again.');
      return;
    }

    setQuoteNumber(json.quoteNumber);
    if (json.draftOrderName) {
      setDraftOrderName(json.draftOrderName);
    }
    clearQuote();
    setSubmitted(true);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-14 max-w-lg w-full text-center shadow-sm border border-[#eeebe6]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
            Quote #{quoteNumber}
          </p>
          <h1 className="text-2xl font-bold text-[#111] mb-3">
            Quote Request Received!
          </h1>
          <p className="text-[15px] text-[#555] leading-relaxed mb-4">
            Thank you! We've received your quote request and will review it shortly.
            You'll receive a reply at{' '}
            <span className="font-semibold text-[#333]">{session?.user?.email}</span>{' '}
            with pricing and availability.
          </p>
          {draftOrderName && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-[13px] text-blue-700 font-semibold">
                Order Reference: {draftOrderName}
              </p>
              <p className="text-[12px] text-blue-600 mt-1">
                Your quote has been registered in our system.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3.5 bg-[#111] hover:bg-[#2a2a2a] text-white rounded-full text-[13px] font-semibold text-center transition-colors"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#888] hover:text-[#333] text-sm transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Continue Browsing
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ClipboardList size={24} className="text-[#111]" />
          <h1 className="text-2xl font-bold text-[#111]">Request a Quote</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-6 border border-[#eeebe6]">
                <h2 className="text-[15px] font-bold text-[#111] mb-5">
                  Shipping Address
                </h2>
                <div className="flex flex-col gap-4">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-[#333]">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('shippingAddress')}
                      placeholder="123 Main St"
                      className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                    />
                    {errors.shippingAddress && (
                      <p className="text-xs text-red-500">{errors.shippingAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#333]">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingCity')}
                        placeholder="Miami"
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                      />
                      {errors.shippingCity && (
                        <p className="text-xs text-red-500">{errors.shippingCity.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#333]">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingState')}
                        placeholder="FL"
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                      />
                      {errors.shippingState && (
                        <p className="text-xs text-red-500">{errors.shippingState.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#333]">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingZip')}
                        placeholder="33101"
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                      />
                      {errors.shippingZip && (
                        <p className="text-xs text-red-500">{errors.shippingZip.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-[#333]">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingCountry')}
                        placeholder="United States"
                        className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                      />
                      {errors.shippingCountry && (
                        <p className="text-xs text-red-500">{errors.shippingCountry.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl p-6 border border-[#eeebe6]">
                <h2 className="text-[15px] font-bold text-[#111] mb-5">
                  Additional Notes
                </h2>
                <textarea
                  {...register('notes')}
                  placeholder="Special requirements, preferred delivery timeframe, bulk pricing questions..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all resize-none"
                />
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 bg-[#2b7fff] hover:bg-[#1a6fee] disabled:opacity-60 text-white rounded-full text-[13px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                Submit Quote Request
              </button>
            </form>
          </div>

          {/* ── Right: Quote Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#eeebe6] overflow-hidden sticky top-24">

              <div className="px-6 py-4 border-b border-[#eeebe6]">
                <h2 className="text-[15px] font-bold text-[#111]">
                  Quote Summary ({totalItems} items)
                </h2>
              </div>

              <div className="divide-y divide-[#f5f2ed]">
                {items.map((item) => (
                  <div key={item.variantId} className="px-6 py-4 flex gap-3">
                    {/* Image */}
                    <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#f8f7f4]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productTitle}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f0ece4]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111] line-clamp-1">
                        {item.productTitle}
                      </p>
                      {item.variantTitle !== 'Default Title' && (
                        <p className="text-xs text-[#999] mt-0.5">{item.variantTitle}</p>
                      )}
                      <p className="text-xs text-[#666] mt-0.5">
                        Qty: {item.quantity}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.variantId, item.quantity - 1)
                              : removeItem(item.variantId)
                          }
                          className="w-5 h-5 rounded bg-[#f8f7f4] flex items-center justify-center text-[#555] hover:bg-[#eeebe6]"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={9} />
                          ) : (
                            <Minus size={9} />
                          )}
                        </button>
                        <span className="text-xs font-bold text-[#333] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-[#f8f7f4] flex items-center justify-center text-[#555] hover:bg-[#eeebe6]"
                        >
                          <Plus size={9} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer info */}
              <div className="px-6 py-4 border-t border-[#eeebe6] bg-[#faf9f7]">
                <p className="text-[12px] text-[#888] mb-1 font-medium uppercase tracking-wider">
                  Sending as
                </p>
                <p className="text-sm font-semibold text-[#333]">
                  {(session?.user as any)?.firstName} {(session?.user as any)?.lastName}
                </p>
                <p className="text-sm text-[#666]">{session?.user?.email}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}