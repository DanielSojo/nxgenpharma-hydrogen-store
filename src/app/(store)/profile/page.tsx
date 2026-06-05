'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, MapPin, Save, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zip: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const emptyProfile: ProfileForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
};

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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfile,
  });

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setLoadingProfile(false);
      return;
    }

    const controller = new AbortController();

    const loadProfile = async () => {
      setServerError('');
      setLoadingProfile(true);

      try {
        const response = await fetch('/api/customer/profile', {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error ?? 'Failed to load profile');
        }

        reset(data.profile ?? emptyProfile);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setServerError(error instanceof Error ? error.message : 'Failed to load profile');
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => controller.abort();
  }, [reset, status]);

  const onSubmit = async (values: ProfileForm) => {
    setServerError('');

    const response = await fetch('/api/customer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok || data.error) {
      const message = data.error ?? 'Failed to update profile';
      setServerError(message);
      toast.error(message);
      return;
    }

    reset(data.profile ?? values);
    await update({
      ...session,
      user: {
        ...session?.user,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`.trim(),
      },
    });
    toast.success('Profile updated');
  };

  if (loadingProfile || status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          Please sign in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft size={16} /> Back to Store
      </Link>

      <div className="mb-8 rounded-3xl bg-gradient-to-br from-brand-mist via-white to-brand-surface p-8 ring-1 ring-brand-line">
        <div className="flex items-center gap-3">
          <UserCircle2 size={24} className="text-brand-blue" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">Account</p>
            <h1 className="mt-2 text-2xl font-bold text-brand-navy">Profile Settings</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-ink/72">
          Keep your contact details and default shipping address up to date for quotes and orders.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 rounded-3xl border border-brand-line bg-white p-8 shadow-sm">
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <UserCircle2 size={16} className="text-brand-blue" />
            <h2 className="text-[15px] font-bold text-brand-navy">Contact Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First Name" required error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name" required error={errors.lastName?.message} {...register('lastName')} />
            <div className="md:col-span-2">
              <Input label="Email Address" required type="email" error={errors.email?.message} {...register('email')} />
            </div>
            <div className="md:col-span-2">
              <Input label="Phone Number" required type="tel" error={errors.phone?.message} {...register('phone')} />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-brand-blue" />
            <h2 className="text-[15px] font-bold text-brand-navy">Default Address</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input label="Company" error={errors.company?.message} {...register('company')} />
            </div>
            <div className="md:col-span-2">
              <Input label="Street Address" required error={errors.address1?.message} {...register('address1')} />
            </div>
            <div className="md:col-span-2">
              <Input label="Address Line 2" error={errors.address2?.message} {...register('address2')} />
            </div>
            <Input label="City" required error={errors.city?.message} {...register('city')} />
            <Input label="State / Province" required error={errors.state?.message} {...register('state')} />
            <Input label="ZIP / Postal Code" required error={errors.zip?.message} {...register('zip')} />
            <Input label="Country" required error={errors.country?.message} {...register('country')} />
          </div>
        </div>

        <div className="rounded-2xl bg-brand-mist px-4 py-3 text-sm text-brand-ink/70">
          Email changes update your Shopify account immediately. If you use the new email to sign in later, this page and the header will stay in sync.
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
