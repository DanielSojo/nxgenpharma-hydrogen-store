'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Shopify sends the full reset URL as a query param
  // e.g. /reset-password?url=https://store.myshopify.com/account/reset/...
  // OR Shopify may redirect directly to your domain with the reset URL path
  const resetUrl = searchParams.get('url') ?? searchParams.get('reset_url');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');

    if (!resetUrl) {
      setServerError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetUrl,
        password: data.password,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 3000);
  };

  // No reset URL found in params
  if (!resetUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <h1 className="mb-3 text-xl font-bold text-brand-navy">Invalid Reset Link</h1>
          <p className="mb-8 text-[14px] leading-relaxed text-brand-ink/72">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full rounded-full bg-brand-blue py-3.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-brand-navy"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-10 shadow-2xl">

          {/* Logo */}
          <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-6">
            <path
              d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
              stroke="#1a1d6d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h1 className="mb-3 text-xl font-bold text-brand-navy">Password Updated!</h1>
              <p className="mb-2 text-[14px] leading-relaxed text-brand-ink/72">
                Your password has been reset successfully.
              </p>
              <p className="text-[13px] text-brand-ink/50">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-bold text-brand-navy">Set New Password</h1>
              <p className="mb-7 text-[14px] leading-relaxed text-brand-ink/72">
                Choose a strong password for your account.
              </p>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-[13px] text-red-600">{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35" size={15} />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-brand-line bg-brand-surface py-3 pl-10 pr-10 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35 hover:text-brand-ink/65"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35" size={15} />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      className="w-full rounded-xl border border-brand-line bg-brand-surface py-3 pl-10 pr-10 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35 hover:text-brand-ink/65"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-[13px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  Update Password
                </button>

                <Link
                  href="/login"
                  className="text-center text-[13px] text-brand-ink/55 transition-colors hover:text-brand-navy"
                >
                  Back to Sign In
                </Link>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
