'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

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
    <label className="text-[13px] font-medium text-[#333]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
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
    <label className="text-[13px] font-medium text-[#333]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      className="w-full px-4 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all appearance-none"
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
        <div className="bg-[#f0ece4] rounded-2xl p-14 max-w-md w-full text-center shadow-2xl">
          <CheckCircle className="mx-auto mb-5 text-green-600" size={56} />
          <h1 className="text-2xl font-bold text-[#111] mb-3">Application Received!</h1>
          <p className="text-[15px] text-[#555] leading-relaxed mb-8">
            Thank you for applying. We'll review your application and respond within 24 hours to the email you provided.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-8 bg-[#111] text-white rounded-full text-[13px] font-semibold hover:bg-[#2a2a2a] transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-10 px-5">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <div className="bg-[#f0ece4] rounded-2xl p-10 shadow-2xl">
            <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-5">
              <path
                d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
                stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-2xl font-bold text-[#111] mb-2">Apply for a B2B Account</h1>
            <p className="text-[14px] text-[#555] leading-relaxed">
              Complete the form below to request access to our B2B platform. We review all applications within 24 hours.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#f0ece4] rounded-2xl p-10 shadow-2xl flex flex-col gap-6">

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Personal Info */}
          <div>
            <h2 className="text-[15px] font-bold text-[#111] mb-4 pb-2 border-b border-[#ddd8cf]">
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
            <h2 className="text-[15px] font-bold text-[#111] mb-4 pb-2 border-b border-[#ddd8cf]">
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
            <h2 className="text-[15px] font-bold text-[#111] mb-4 pb-2 border-b border-[#ddd8cf]">
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
            <label className="text-[13px] font-medium text-[#333]">
              Additional Information <span className="text-[#999]">(optional)</span>
            </label>
            <textarea
              {...register('message')}
              placeholder="Tell us more about your business and purchasing needs..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#111] hover:bg-[#2a2a2a] disabled:opacity-60 text-white rounded-full text-[13px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            Submit Application
          </button>
        </form>

      </div>
    </div>
  );
}
