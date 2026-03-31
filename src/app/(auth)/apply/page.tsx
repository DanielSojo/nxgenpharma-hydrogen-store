'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
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
  taxId: z.string().optional(),
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
      className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
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
    <select
      {...props}
      className="w-full appearance-none rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
    >
      {children}
    </select>
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
  } = useForm<ApplicationForm>({ resolver: zodResolver(applicationSchema) });

  const onSubmit = async (data: ApplicationForm) => {
    setServerError('');
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
      <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-14 text-center shadow-2xl">
          <CheckCircle className="mx-auto mb-5 text-green-600" size={56} />
          <h1 className="mb-3 text-2xl font-bold text-brand-navy">Application Received!</h1>
          <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/72">
            Thank you for applying. We'll review your application and respond within 24 hours to the email you provided.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-brand-navy px-8 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-mist py-10 px-5">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <div className="rounded-2xl bg-white p-10 shadow-2xl">
            <Image src="/nxgenpharma-logo.png" width={100} height={100} alt='NxGen Pharma Logo' />
            <h1 className="mb-2 text-2xl font-bold text-brand-navy">Apply for a B2B Account</h1>
            <p className="text-[14px] leading-relaxed text-brand-ink/72">
              Complete the form below to request access to our B2B platform. We review all applications within 24 hours.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 rounded-2xl bg-white p-10 shadow-2xl">

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
                <Input label="Phone Number" required type="tel" placeholder="+1 (555) 000-0000" error={errors.phone?.message} {...register('phone')} />
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
                <Input label="Tax ID / EIN" placeholder="XX-XXXXXXX (optional)" error={errors.taxId?.message} {...register('taxId')} />
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
                <option value="CA">Canada</option>
                <option value="MX">Mexico</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
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
              className="w-full resize-none rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-4 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-blue disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            Submit Application
          </button>
        </form>

      </div>
    </div>
  );
}
