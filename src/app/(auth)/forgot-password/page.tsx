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
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-brand-ink/55 transition-colors hover:text-brand-navy"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="rounded-2xl bg-white p-10 shadow-2xl">

          {/* Logo */}
          <svg width="44" height="30" viewBox="0 0 60 36" fill="none" className="mb-6">
            <path
              d="M4 22 C10 10, 18 10, 24 18 C30 26, 38 26, 44 18 C50 10, 56 14, 56 14"
              stroke="#1a1d6d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>

          {submitted ? (
            // ── Success State ──
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h1 className="mb-3 text-xl font-bold text-brand-navy">Check your email</h1>
              <p className="mb-2 text-[14px] leading-relaxed text-brand-ink/72">
                If an account exists for
              </p>
              <p className="mb-4 text-[14px] font-semibold text-brand-ink">
                {submittedEmail}
              </p>
              <p className="mb-8 text-[14px] leading-relaxed text-brand-ink/72">
                you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <Link
                href="/login"
                className="inline-block w-full rounded-full bg-brand-navy py-3.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            // ── Form State ──
            <>
              <h1 className="mb-2 text-xl font-bold text-brand-navy">Reset your password</h1>
              <p className="mb-7 text-[14px] leading-relaxed text-brand-ink/72">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">Email</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35"
                      size={15}
                    />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="example@mail.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-brand-line bg-brand-surface py-3 pl-10 pr-4 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-[13px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                  Send Reset Link
                </button>

                <Link
                  href="/login"
                  className="text-center text-[13px] text-brand-ink/55 transition-colors hover:text-brand-navy"
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
