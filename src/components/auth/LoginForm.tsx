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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-5">
      <div className="w-full max-w-5xl min-h-[640px] rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

        <div
          className="hidden md:block relative bg-[#1a1a1a] overflow-hidden"
          style={{
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
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

        <div className="bg-[#f0ece4] flex flex-col justify-center px-10 py-12">
          <div className="mb-7">
            <Image src="/nxgenpharma-logo.png" width={100} height={100} alt='NxGen Pharma Logo' />
          </div>

          <p className="font-serif text-[17px] text-[#1a1a1a] mb-7 leading-relaxed">
            Sign in below to access our B2B platform.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#333]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={15} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="example@mail.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#333]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={15} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
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
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-[#444] cursor-pointer">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="w-4 h-4 accent-[#2b7fff]"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#2b7fff] hover:opacity-70 transition-opacity"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#2b7fff] hover:bg-[#1a6fee] disabled:opacity-60 text-white rounded-xl text-[13px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="h-px bg-[#ddd8cf] my-7" />

          <div>
            <p className="text-[18px] font-bold text-[#1a1a1a] mb-2.5">
              Open an account with us!
            </p>
            <p className="text-[13.5px] text-[#555] leading-relaxed mb-5">
              Click on the button below to apply for an account with us. We respond within 24 hours.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/apply"
                className="flex flex-1 items-center justify-center min-w-[140px] py-3.5 px-5 bg-[#111] hover:bg-[#2a2a2a] text-white rounded-full text-[13px] font-semibold text-center transition-colors"
              >
                Apply for an account
              </Link>
              <Link
                href="/contact"
                className="flex-1 min-w-[140px] py-3.5 px-5 border-2 border-[#111] text-[#111] hover:bg-[#111] hover:text-white rounded-full text-[13px] font-semibold text-center transition-colors"
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
