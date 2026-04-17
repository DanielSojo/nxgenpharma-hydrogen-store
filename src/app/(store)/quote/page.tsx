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
  addressMode: z.enum(['saved', 'new']),
  notes: z.string().optional(),
  expectedDelivery: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCountry: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.addressMode === 'new') {
    if (!data.shippingAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingAddress'],
        message: 'Shipping address is required',
      });
    }
    if (!data.shippingCity?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingCity'],
        message: 'City is required',
      });
    }
    if (!data.shippingState?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingState'],
        message: 'State is required',
      });
    }
    if (!data.shippingZip?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingZip'],
        message: 'ZIP code is required',
      });
    }
    if (!data.shippingCountry?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['shippingCountry'],
        message: 'Country is required',
      });
    }
  }
});

type QuoteForm = z.infer<typeof quoteSchema>;

interface SavedAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function QuotePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, clearQuote } = useQuoteStore();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [draftOrderName, setDraftOrderName] = useState('');
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [addressError, setAddressError] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      addressMode: 'new',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      shippingCountry: '',
      notes: '',
      expectedDelivery: '',
    },
  });

  const addressMode = watch('addressMode');

  useEffect(() => {
    if (items.length === 0 && !submitted) {
      router.push('/');
    }
  }, [items, submitted, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedAddress() {
      if (!session?.user?.id) {
        setLoadingAddress(false);
        return;
      }

      try {
        setLoadingAddress(true);
        setAddressError('');

        const res = await fetch('/api/customer/address');
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error ?? 'Failed to load saved address');
        }

        if (cancelled) return;

        const nextAddress = json.address as SavedAddress | null;
        setSavedAddress(nextAddress);
        reset((currentValues) => ({
          ...currentValues,
          addressMode: nextAddress ? 'saved' : 'new',
          shippingAddress: nextAddress?.address ?? currentValues.shippingAddress ?? '',
          shippingCity: nextAddress?.city ?? currentValues.shippingCity ?? '',
          shippingState: nextAddress?.state ?? currentValues.shippingState ?? '',
          shippingZip: nextAddress?.zip ?? currentValues.shippingZip ?? '',
          shippingCountry: nextAddress?.country ?? currentValues.shippingCountry ?? '',
        }));
      } catch (error) {
        if (cancelled) return;
        setAddressError(
          error instanceof Error ? error.message : 'Failed to load saved address'
        );
      } finally {
        if (!cancelled) {
          setLoadingAddress(false);
        }
      }
    }

    loadSavedAddress();

    return () => {
      cancelled = true;
    };
  }, [reset, session?.user?.id]);

  const onSubmit = async (formData: QuoteForm) => {
    setServerError('');

    const shipping =
      formData.addressMode === 'saved' && savedAddress
        ? {
            address: savedAddress.address,
            city: savedAddress.city,
            state: savedAddress.state,
            zip: savedAddress.zip,
            country: savedAddress.country,
          }
        : {
            address: formData.shippingAddress ?? '',
            city: formData.shippingCity ?? '',
            state: formData.shippingState ?? '',
            zip: formData.shippingZip ?? '',
            country: formData.shippingCountry ?? '',
          };

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items,
        customer: {
          name: `${(session?.user as any)?.firstName ?? ''} ${(session?.user as any)?.lastName ?? ''}`.trim(),
          email: session?.user?.email,
        },
        shipping,
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
      <div className="flex min-h-screen items-center justify-center bg-brand-mist p-6">
        <div className="w-full max-w-lg rounded-2xl border border-brand-line bg-white p-14 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
            Quote #{quoteNumber}
          </p>
          <h1 className="mb-3 text-2xl font-bold text-brand-navy">
            Quote Request Received!
          </h1>
          <p className="mb-4 text-[15px] leading-relaxed text-brand-ink/72">
            Thank you! We've received your quote request and will review it shortly.
            You'll receive a reply at{' '}
            <span className="font-semibold text-brand-ink">{session?.user?.email}</span>{' '}
            with pricing and availability.
          </p>
          {draftOrderName && (
            <div className="mb-6 rounded-xl border border-brand-line bg-brand-mist p-4 text-left">
              <p className="text-[13px] font-semibold text-brand-navy">
                Order Reference: {draftOrderName}
              </p>
              <p className="mt-1 text-[12px] text-brand-blue">
                Your quote has been registered in our system.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-full bg-brand-navy py-3.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft size={16} /> Continue Browsing
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <ClipboardList size={24} className="text-brand-blue" />
          <h1 className="text-2xl font-bold text-brand-navy">Request a Quote</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

              {/* Shipping Address */}
              <div className="rounded-2xl border border-brand-line bg-white p-6">
                <h2 className="mb-5 text-[15px] font-bold text-brand-navy">
                  Shipping Address
                </h2>
                <div className="flex flex-col gap-4">
                  {loadingAddress ? (
                    <div className="rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink/60">
                      Loading saved address...
                    </div>
                  ) : savedAddress ? (
                    <div className="flex flex-col gap-3">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line p-4 transition-colors hover:border-brand-blue">
                        <input
                          type="radio"
                          value="saved"
                          {...register('addressMode')}
                          className="mt-1"
                        />
                        <div className="text-sm text-brand-ink">
                          <p className="font-semibold text-brand-navy">Use saved address</p>
                          <p className="mt-1 text-brand-ink/70">
                            {[savedAddress.address, `${savedAddress.city}, ${savedAddress.state} ${savedAddress.zip}`, savedAddress.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </label>

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line p-4 transition-colors hover:border-brand-blue">
                        <input
                          type="radio"
                          value="new"
                          {...register('addressMode')}
                          className="mt-1"
                        />
                        <div className="text-sm text-brand-ink">
                          <p className="font-semibold text-brand-navy">Use a new address</p>
                          <p className="mt-1 text-brand-ink/70">
                            Enter a different shipping address for this quote request.
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink/60">
                      No saved address was found on your account. Enter a shipping address below.
                    </div>
                  )}

                  {addressError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {addressError}
                    </div>
                  )}

                  {(addressMode === 'new' || !savedAddress) && (
                    <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-brand-ink">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('shippingAddress')}
                      placeholder="123 Main St"
                      className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                    />
                    {errors.shippingAddress && (
                      <p className="text-xs text-red-500">{errors.shippingAddress.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-ink">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingCity')}
                        placeholder="Miami"
                        className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                      />
                      {errors.shippingCity && (
                        <p className="text-xs text-red-500">{errors.shippingCity.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-ink">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingState')}
                        placeholder="FL"
                        className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                      />
                      {errors.shippingState && (
                        <p className="text-xs text-red-500">{errors.shippingState.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-ink">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingZip')}
                        placeholder="33101"
                        className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                      />
                      {errors.shippingZip && (
                        <p className="text-xs text-red-500">{errors.shippingZip.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-brand-ink">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('shippingCountry')}
                        placeholder="United States"
                        className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                      />
                      {errors.shippingCountry && (
                        <p className="text-xs text-red-500">{errors.shippingCountry.message}</p>
                      )}
                    </div>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border border-brand-line bg-white p-6">
                <h2 className="mb-5 text-[15px] font-bold text-brand-navy">
                  Additional Notes
                </h2>
                <textarea
                  {...register('notes')}
                  placeholder="Special requirements, preferred delivery timeframe, bulk pricing questions..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
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
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue py-4 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                Submit Quote Request
              </button>
            </form>
          </div>

          {/* ── Right: Quote Summary ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-brand-line bg-white">

              <div className="border-b border-brand-line px-6 py-4">
                <h2 className="text-[15px] font-bold text-brand-navy">
                  Quote Summary ({totalItems} items)
                </h2>
              </div>

              <div className="divide-y divide-brand-line/60">
                {items.map((item) => (
                  <div key={item.variantId} className="px-6 py-4 flex gap-3">
                    {/* Image */}
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-brand-mist">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productTitle}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="h-full w-full bg-brand-mist" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-brand-navy">
                        {item.productTitle}
                      </p>
                      {item.variantTitle !== 'Default Title' && (
                        <p className="mt-0.5 text-xs text-brand-ink/50">{item.variantTitle}</p>
                      )}
                      <p className="mt-0.5 text-xs text-brand-ink/65">
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
                          className="flex h-5 w-5 items-center justify-center rounded bg-brand-mist text-brand-ink/70 hover:bg-brand-line"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={9} />
                          ) : (
                            <Minus size={9} />
                          )}
                        </button>
                        <span className="w-4 text-center text-xs font-bold text-brand-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-5 w-5 items-center justify-center rounded bg-brand-mist text-brand-ink/70 hover:bg-brand-line"
                        >
                          <Plus size={9} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer info */}
              <div className="border-t border-brand-line bg-brand-surface px-6 py-4">
                <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-brand-ink/50">
                  Sending as
                </p>
                <p className="text-sm font-semibold text-brand-ink">
                  {(session?.user as any)?.firstName} {(session?.user as any)?.lastName}
                </p>
                <p className="text-sm text-brand-ink/65">{session?.user?.email}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
