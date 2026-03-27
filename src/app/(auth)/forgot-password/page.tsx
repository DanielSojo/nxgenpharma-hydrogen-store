'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await fetch('/api/auth/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });
    // Always show success (don't reveal if email exists)
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="bg-[#f0ece4] rounded-2xl p-10 shadow-2xl">

          {/* Logo */}
          <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-6">
            <path
              d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
              stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>

          {submitted ? (
            // ── Success State ──
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h1 className="text-xl font-bold text-[#111] mb-3">Check your email</h1>
              <p className="text-[14px] text-[#555] leading-relaxed mb-2">
                If an account exists for
              </p>
              <p className="font-semibold text-[#333] text-[14px] mb-4">
                {submittedEmail}
              </p>
              <p className="text-[14px] text-[#555] leading-relaxed mb-8">
                you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <Link
                href="/login"
                className="inline-block w-full py-3.5 bg-[#111] hover:bg-[#2a2a2a] text-white rounded-full text-[13px] font-semibold text-center transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            // ── Form State ──
            <>
              <h1 className="text-xl font-bold text-[#111] mb-2">Reset your password</h1>
              <p className="text-[14px] text-[#555] leading-relaxed mb-7">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#333]">Email</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]"
                      size={15}
                    />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="example@mail.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#2b7fff] hover:bg-[#1a6fee] disabled:opacity-60 text-white rounded-xl text-[13px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors mt-1"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  Send Reset Link
                </button>

                <Link
                  href="/login"
                  className="text-center text-[13px] text-[#888] hover:text-[#333] transition-colors"
                >
                  Remember your password? Sign in
                </Link>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
