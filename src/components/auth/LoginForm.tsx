'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  callbackUrl: string;
}

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password. Please try again.');
        return;
      }

      window.location.href = result?.url ?? callbackUrl;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-aurora flex min-h-screen items-center justify-center p-5">
      <div className="animate-fade-up grid w-full max-w-[1080px] overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_90px_-20px_rgba(23,50,82,0.35)] ring-1 ring-white/40 backdrop-blur-xl md:grid-cols-2">

        <div className="bg-catalog-hero relative hidden overflow-hidden md:block">
          <video
            className="absolute inset-0 h-full w-full object-contain object-center"
            src="/nexgenpharmacy.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,23,52,0.74)_0%,rgba(26,29,109,0.55)_38%,rgba(62,151,218,0.24)_100%)]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at top right, rgba(103,200,184,0.18), transparent 28%),
              radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 24%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.025) 40px,
                rgba(255,255,255,0.025) 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.025) 40px,
                rgba(255,255,255,0.025) 41px
              )`,
            }}
          />

          <div className="absolute inset-x-10 top-10 z-10">
            <p className="max-w-xs text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
              B2B Pharmaceutical Platform
            </p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 z-10 rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/65">
              Trusted Access
            </p>
            <p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">
              Built for wholesale ordering, quoting, and account management in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,252,252,0.95)_100%)] px-8 py-9 sm:px-10 lg:px-12">
          <div className="mb-4">
            <Image src="/nxgenpharma-logo.png" width={88} height={88} alt='NexGen Pharma Logo' />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Welcome back</h1>
          <p className="mb-5 mt-1 text-[14px] leading-relaxed text-brand-ink/60">
            Sign in to access your B2B platform.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-ink">Email</label>
              <div className="group relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35 transition-colors group-focus-within:text-brand-blue" size={15} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@mail.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-brand-line bg-white/70 py-3 pl-10 pr-4 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-ink">Password</label>
              <div className="group relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35 transition-colors group-focus-within:text-brand-blue" size={15} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-brand-line bg-white/70 py-3 pl-10 pr-10 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 hover:border-brand-blue/40 focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35 transition-colors hover:text-brand-blue"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-brand-ink/75">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 accent-brand-blue"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-brand-blue transition-opacity hover:opacity-70"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-brand-gradient mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[13px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/30 active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-line" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ink/40">New here</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-line" />
          </div>

          <div className="rounded-2xl border border-brand-line/70 bg-white/60 p-5">
            <p className="mb-1.5 text-[17px] font-bold text-brand-navy">
              Open an account with us
            </p>
            <p className="mb-4 text-[13.5px] leading-relaxed text-brand-ink/65">
              Apply for a B2B account below — we respond within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="bg-brand-gradient-navy flex min-w-[140px] flex-1 items-center justify-center rounded-full px-5 py-3.5 text-center text-[13px] font-semibold text-white shadow-md shadow-brand-navy/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Apply for an account
              </Link>
              <Link
                href="/contact"
                className="min-w-[140px] flex-1 rounded-full border-2 border-brand-navy/80 px-5 py-3.5 text-center text-[13px] font-semibold text-brand-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-navy hover:bg-brand-navy hover:text-white"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
