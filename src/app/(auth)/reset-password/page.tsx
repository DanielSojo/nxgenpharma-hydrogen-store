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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
        <div className="bg-[#f0ece4] rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <h1 className="text-xl font-bold text-[#111] mb-3">Invalid Reset Link</h1>
          <p className="text-[14px] text-[#555] leading-relaxed mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full py-3.5 bg-[#2b7fff] text-white rounded-full text-[13px] font-semibold text-center hover:bg-[#1a6fee] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-[#f0ece4] rounded-2xl p-10 shadow-2xl">

          {/* Logo */}
          <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-6">
            <path
              d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
              stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>

          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h1 className="text-xl font-bold text-[#111] mb-3">Password Updated!</h1>
              <p className="text-[14px] text-[#555] leading-relaxed mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-[13px] text-[#999]">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111] mb-2">Set New Password</h1>
              <p className="text-[14px] text-[#555] leading-relaxed mb-7">
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
                  <label className="text-[13px] font-medium text-[#333]">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={15} />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666]"
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
                  <label className="text-[13px] font-medium text-[#333]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={15} />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#666]"
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
                  className="w-full py-3.5 bg-[#2b7fff] hover:bg-[#1a6fee] disabled:opacity-60 text-white rounded-xl text-[13px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors mt-1"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  Update Password
                </button>

                <Link
                  href="/login"
                  className="text-center text-[13px] text-[#888] hover:text-[#333] transition-colors"
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
