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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(103,200,184,0.3),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(62,151,218,0.26),_transparent_30%),linear-gradient(135deg,_#f7fcfc_0%,_#edf9f9_45%,_#dff2f4_100%)] p-5">
      <div className="grid min-h-[640px] w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(23,50,82,0.16)] backdrop-blur-sm md:grid-cols-2">

        <div className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#0f2550_0%,#1a1d6d_48%,#3e97da_100%)] md:block">
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,23,52,0.84)_0%,rgba(26,29,109,0.7)_38%,rgba(62,151,218,0.34)_100%)]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at top right, rgba(103,200,184,0.22), transparent 28%),
              radial-gradient(circle at bottom left, rgba(255,255,255,0.1), transparent 24%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.035) 40px,
                rgba(255,255,255,0.035) 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.035) 40px,
                rgba(255,255,255,0.035) 41px
              )`,
            }}
          />

          <div className="absolute inset-x-10 top-10 z-10">
            <p className="max-w-xs text-xs font-semibold uppercase tracking-[0.35em] text-white/75">
              B2B Pharmaceutical Platform
            </p>
          </div>

          <Image className='z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]' src="/nxgenpharma-logo.png" width={400} height={100} alt='NxGen Pharma Logo' />

          <div className="absolute bottom-10 left-10 right-10 z-10 rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/65">
              Trusted Access
            </p>
            <p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">
              Built for wholesale ordering, quoting, and account management in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,252,252,0.98)_100%)] px-10 py-12">
          <div className="mb-7">
            <Image src="/nxgenpharma-logo.png" width={100} height={100} alt='NxGen Pharma Logo' />
          </div>

          <p className="mb-7 font-serif text-[17px] leading-relaxed text-brand-ink">
            Sign in below to access our B2B platform.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-ink">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35" size={15} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@mail.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-brand-line bg-brand-surface py-3 pl-10 pr-4 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-brand-ink">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/35" size={15} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
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
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 text-[13px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-navy disabled:opacity-60"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="my-7 h-px bg-brand-line" />

          <div>
            <p className="mb-2.5 text-[18px] font-bold text-brand-navy">
              Open an account with us!
            </p>
            <p className="mb-5 text-[13.5px] leading-relaxed text-brand-ink/72">
              Click on the button below to apply for an account with us. We respond within 24 hours.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/apply"
                className="flex min-w-[140px] flex-1 items-center justify-center rounded-full bg-brand-navy px-5 py-3.5 text-center text-[13px] font-semibold text-white transition-colors hover:bg-brand-blue"
              >
                Apply for an account
              </Link>
              <Link
                href="/contact"
                className="min-w-[140px] flex-1 rounded-full border-2 border-brand-navy px-5 py-3.5 text-center text-[13px] font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
              >
                Questions? Contact us today!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
