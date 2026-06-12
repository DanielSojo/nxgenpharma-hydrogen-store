'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const applicationSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  company: z.string().min(1, 'Required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  address: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zipCode: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  businessType: z.string().min(1, 'Required'),
  taxId: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit NPI'),
  website: z.string().optional(),
  message: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

const Input = ({
  label,
  error,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-brand-ink">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-brand-line bg-white/70 px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Select = ({
  label,
  error,
  required,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-brand-ink">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="group relative">
      <select
        {...props}
        className="w-full appearance-none rounded-xl border border-brand-line bg-white/70 px-4 py-3 pr-10 text-sm text-brand-ink outline-none transition-all hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/40 transition-colors group-focus-within:text-brand-blue"
        size={16}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default function ApplyPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { country: 'US' },
  });

  const onSubmit = async (data: ApplicationForm) => {
    setServerError('');
    const payload = {
      ...data,
      phone: `+1${data.phone.replace(/\D/g, '')}`,
    };
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const json = await res.json();
      setServerError(json.error ?? 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="auth-aurora flex min-h-screen items-center justify-center p-5">
        <div className="animate-fade-up w-full max-w-md rounded-3xl border border-white/70 bg-white/70 p-14 text-center shadow-[0_30px_90px_-20px_rgba(23,50,82,0.35)] ring-1 ring-white/40 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-600" size={36} />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-brand-navy">Application Received!</h1>
          <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/65">
            Thank you for applying. We'll review your application and respond within 24 hours to the email you provided.
          </p>
          <Link
            href="/login"
            className="bg-brand-gradient-navy inline-block rounded-full px-8 py-3 text-[13px] font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-aurora min-h-screen px-5 py-10">
      <div className="animate-fade-up mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_24px_70px_-20px_rgba(23,50,82,0.3)] ring-1 ring-white/40 backdrop-blur-xl">
            <div className="bg-brand-gradient-navy px-10 pb-10 pt-8 text-white">
              <Image src="/nxgenpharma-logo.png" width={88} height={88} alt='NexGen Pharma Logo' className="mb-4 brightness-0 invert" />
              <h1 className="mb-2 text-2xl font-bold tracking-tight">Apply for a B2B Account</h1>
              <p className="max-w-md text-[14px] leading-relaxed text-white/75">
                Complete the form below to request access to our B2B platform. We review all applications within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/70 p-8 shadow-[0_24px_70px_-20px_rgba(23,50,82,0.3)] ring-1 ring-white/40 backdrop-blur-xl sm:p-10">

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" required placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" required placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
              <div className="col-span-2">
                <Input label="Email Address" required type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
              </div>
              <div className="col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-brand-line bg-white/70 transition-all hover:border-brand-blue/40 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/10">
                    <span className="border-r border-brand-line pl-4 pr-3 text-sm font-medium text-brand-ink/55">+1</span>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      {...register('phone')}
                      className="w-full rounded-xl bg-transparent py-3 pl-3 pr-4 text-sm text-brand-ink outline-none placeholder:text-brand-ink/35"
                    />
                  </div>
                  {errors.phone?.message && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Business Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Company Name" required placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
              </div>
              <div className="col-span-2">
                <Select label="Business Type" required error={errors.businessType?.message} {...register('businessType')}>
                  <option value="">Select business type...</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="clinic">Clinic / Medical Practice</option>
                  <option value="hospital">Hospital</option>
                  <option value="distributor">Distributor / Wholesaler</option>
                  <option value="research">Research Laboratory</option>
                  <option value="compounding">Compounding Pharmacy</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="col-span-2">
                <Input label="NPI" required placeholder="1234567890" error={errors.taxId?.message} {...register('taxId')} />
              </div>
              <div className="col-span-2">
                <Input label="Website" type="url" placeholder="https://yourcompany.com (optional)" error={errors.website?.message} {...register('website')} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Business Address
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Street Address" required placeholder="123 Main St" error={errors.address?.message} {...register('address')} />
              </div>
              <Input label="City" required placeholder="Miami" error={errors.city?.message} {...register('city')} />
              <Input label="State / Province" required placeholder="FL" error={errors.state?.message} {...register('state')} />
              <Input label="ZIP / Postal Code" required placeholder="33101" error={errors.zipCode?.message} {...register('zipCode')} />
              <Select label="Country" required error={errors.country?.message} {...register('country')}>
                <option value="">Select country...</option>
                <option value="US">United States</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-ink">
              Additional Information <span className="text-brand-ink/50">(optional)</span>
            </label>
            <textarea
              {...register('message')}
              placeholder="Tell us more about your business and purchasing needs..."
              rows={4}
              className="w-full resize-none rounded-xl border border-brand-line bg-white/70 px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-gradient mt-2 flex w-full items-center justify-center gap-2 rounded-full py-4 text-[13px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/30 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            Submit Application
          </button>
        </form>

      </div>
    </div>
  );
}
