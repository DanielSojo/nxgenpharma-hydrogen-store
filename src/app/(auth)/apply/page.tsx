'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle, ChevronDown, Lock, Eye, EyeOff, Check } from 'lucide-react';
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
  referralSource: z.string().min(1, 'Required'),
  referralSourceOther: z.string().optional(),
  message: z.string().optional(),
  // Length over composition rules, per current NIST guidance. Shopify's own
  // floor is 5; we ask for 8 and reject padded whitespace, which Shopify
  // rejects server-side anyway.
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(72, 'Use 72 characters or fewer')
    .refine((value) => value.trim() === value, {
      message: 'Cannot start or end with a space',
    }),
  confirmPassword: z.string().min(1, 'Please re-enter your password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { path: ['confirmPassword'], message: 'Passwords do not match' },
).refine(
  (data) => data.referralSource !== 'Other' || (data.referralSourceOther?.trim().length ?? 0) > 0,
  { path: ['referralSourceOther'], message: 'Please tell us how you heard about us' },
);

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
      className="w-full rounded-xl border border-brand-line bg-white/70 px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/60 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
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
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/60 transition-colors group-focus-within:text-brand-blue"
        size={16}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const PasswordInput = ({
  label,
  error,
  hint,
  registration,
  autoComplete,
  placeholder,
}: {
  label: string;
  error?: string;
  hint?: string;
  registration: UseFormRegisterReturn;
  autoComplete: string;
  placeholder?: string;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-brand-ink">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="group relative">
        <Lock
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/60 transition-colors group-focus-within:text-brand-blue"
          size={15}
        />
        <input
          {...registration}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-xl border border-brand-line bg-white/70 py-3 pl-10 pr-11 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/60 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/60 transition-colors hover:text-brand-blue"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-brand-ink/70">{hint}</p>
      ) : null}
    </div>
  );
};

export default function ApplyPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [existingAccount, setExistingAccount] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { country: 'US' },
  });

  const showReferralOther = watch('referralSource') === 'Other';

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordsMatch =
    Boolean(password) && password.length >= 8 && password === confirmPassword;

  const onSubmit = async (data: ApplicationForm) => {
    setServerError('');
    setExistingAccount(null);
    // The confirmation never leaves the browser — it exists only to catch typos.
    const { confirmPassword: _confirmPassword, ...submitted } = data;
    const payload = {
      ...submitted,
      phone: `+1${data.phone.replace(/\D/g, '')}`,
      referralSource:
        data.referralSource === 'Other' && data.referralSourceOther?.trim()
          ? `Other: ${data.referralSourceOther.trim()}`
          : data.referralSource,
    };
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSubmitted(true);
      return;
    }

    const json = await res.json();
    const message = json.error ?? 'Something went wrong. Please try again.';

    // Shopify reports which input it rejected; mirror that instead of assuming.
    // Anything outside this list is not a field the applicant can edit here.
    const serverField = (
      ['email', 'phone', 'password', 'firstName', 'lastName'] as const
    ).find((name) => name === json.field);

    if (serverField) {
      setError(serverField, { type: 'server', message });

      // A taken email is the one conflict the applicant can't resolve by
      // editing the form, so that case also gets a banner with somewhere to go.
      // A taken phone number they can simply correct in place.
      if (res.status === 409 && serverField === 'email') {
        setExistingAccount(message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setFocus(serverField);
      }
      return;
    }

    setServerError(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="auth-aurora flex min-h-screen items-center justify-center p-5">
        <div className="animate-fade-up w-full max-w-md rounded-3xl border border-white/70 bg-white/70 p-14 text-center shadow-[0_30px_90px_-20px_rgba(23,50,82,0.35)] ring-1 ring-white/40 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-600" size={36} />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-brand-navy">Application Received!</h1>
          <p className="mb-8 text-[15px] leading-relaxed text-brand-ink/70">
            Thank you for applying. We&apos;ll review your application and respond within 24 hours
            to the email you provided. Once you&apos;re approved, sign in with the email and
            password you just chose — no activation link needed.
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
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-ink/70 transition-colors hover:text-brand-navy"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_24px_70px_-20px_rgba(23,50,82,0.3)] ring-1 ring-white/40 backdrop-blur-xl">
            <div className="bg-catalog-hero px-10 pb-10 pt-8 text-white">
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

          {existingAccount && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">{existingAccount}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="bg-brand-gradient-navy inline-flex items-center rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Sign in
                </Link>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center rounded-full border border-amber-300 px-5 py-2 text-[13px] font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Reset my password
                </Link>
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" required placeholder="John" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name" required placeholder="Doe" error={errors.lastName?.message} {...register('lastName')} />
              <div className="sm:col-span-2">
                <Input label="Email Address" required type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
              </div>
              <div className="sm:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-brand-line bg-white/70 transition-all hover:border-brand-blue/40 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/10">
                    <span className="border-r border-brand-line pl-4 pr-3 text-sm font-medium text-brand-ink/70">+1</span>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      {...register('phone')}
                      className="w-full rounded-xl bg-transparent py-3 pl-3 pr-4 text-sm text-brand-ink outline-none placeholder:text-brand-ink/60"
                    />
                  </div>
                  {errors.phone?.message && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Account Security
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <PasswordInput
                  label="Password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  hint="You'll use this to sign in once your account is approved."
                  error={errors.password?.message}
                  registration={register('password')}
                />
              </div>
              <div className="sm:col-span-2">
                <PasswordInput
                  label="Confirm Password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  error={errors.confirmPassword?.message}
                  registration={register('confirmPassword')}
                />
                {passwordsMatch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <Check size={13} /> Passwords match
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Business Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Company Name" required placeholder="Acme Corp" error={errors.company?.message} {...register('company')} />
              </div>
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2">
                <Input label="NPI" required placeholder="1234567890" error={errors.taxId?.message} {...register('taxId')} />
              </div>
              <div className="sm:col-span-2">
                <Input label="Website" type="url" placeholder="https://yourcompany.com (optional)" error={errors.website?.message} {...register('website')} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="mb-4 border-b border-brand-line pb-2 text-[15px] font-bold text-brand-navy">
              Business Address
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
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

          {/* How did you hear about us */}
          <Select label="How did you hear about us?" required error={errors.referralSource?.message} {...register('referralSource')}>
            <option value="">Select an option...</option>
            <option value="Search Engine">Search Engine (Google, Bing)</option>
            <option value="Social Media">Social Media</option>
            <option value="Referral / Word of Mouth">Referral / Word of Mouth</option>
            <option value="Conference / Trade Show">Conference / Trade Show</option>
            <option value="Email">Email</option>
            <option value="Advertisement">Advertisement</option>
            <option value="Other">Other</option>
          </Select>

          {showReferralOther && (
            <Input
              label="Please specify"
              required
              placeholder="How did you hear about us?"
              error={errors.referralSourceOther?.message}
              {...register('referralSourceOther')}
            />
          )}

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-brand-ink">
              Additional Information <span className="text-brand-ink/70">(optional)</span>
            </label>
            <textarea
              {...register('message')}
              placeholder="Tell us more about your business and purchasing needs..."
              rows={4}
              className="w-full resize-none rounded-xl border border-brand-line bg-white/70 px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/60 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
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
