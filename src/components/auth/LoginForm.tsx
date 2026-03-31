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
    <div className="flex min-h-screen items-center justify-center bg-brand-mist p-5">
      <div className="w-full max-w-5xl min-h-[640px] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

        <div
          className="relative hidden overflow-hidden md:block"
          style={{
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue/90" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.03) 40px,
                rgba(255,255,255,0.03) 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(255,255,255,0.03) 40px,
                rgba(255,255,255,0.03) 41px
              )`,
            }}
          />

          <Image className='z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' src="/nxgenpharma-logo.png" width={400} height={100} alt='NxGen Pharma Logo' />
        </div>

        <div className="flex flex-col justify-center bg-white px-10 py-12">
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
