'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    setServerError('');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const json = await res.json();
      setServerError(json.error ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
          Get in Touch
        </p>
        <h1 className="text-3xl font-bold text-[#111] mb-3">Contact Us</h1>
        <p className="text-[#666] text-base max-w-xl leading-relaxed">
          Have questions about our products, pricing, or becoming a B2B partner?
          Our team responds within 24 hours on business days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

        {/* ── Left: Info ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Contact Details */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-[#2b7fff]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#333] uppercase tracking-wider mb-1">Email</p>
                <a
                  href="mailto:info@nxgenpharma.com"
                  className="text-sm text-[#2b7fff] hover:opacity-70 transition-opacity"
                >
                  info@nxgenpharma.com
                </a>
                <p className="text-xs text-[#999] mt-0.5">Business inquiries only</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-[#2b7fff]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#333] uppercase tracking-wider mb-1">Phone</p>
                <a
                  href="tel:+18444962712"
                  className="text-sm text-[#2b7fff] hover:opacity-70 transition-opacity"
                >
                  +1 (844) 496-2712
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-[#2b7fff]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#333] uppercase tracking-wider mb-1">
                  Business Hours
                </p>
                <p className="text-sm text-[#555]">Mon – Fri: 9AM – 5PM EST</p>
                <p className="text-sm text-[#555]">Saturday: Delivery available</p>
                <p className="text-sm text-[#999]">Closed on holidays</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#f0ece4] rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-[#2b7fff]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#333] uppercase tracking-wider mb-1">
                  Shipping
                </p>
                <p className="text-sm text-[#555]">Orders placed before 12PM EST</p>
                <p className="text-sm text-[#555]">ship the same business day</p>
              </div>
            </div>
          </div>

          {/* Apply CTA */}
          <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2b7fff] mb-2">
              New Customer?
            </p>
            <h3 className="text-lg font-bold mb-2">Apply for B2B Access</h3>
            <p className="text-[#888] text-sm leading-relaxed mb-5">
              Get access to our full catalog and B2B pricing by applying for an account.
            </p>
            <a
              href="/apply"
              className="inline-block w-full py-3 bg-white text-[#111] rounded-full text-[13px] font-bold text-center hover:bg-[#f0ece4] transition-colors"
            >
              Apply for an Account
            </a>
          </div>

        </div>

        {/* ── Right: Form ── */}
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="bg-white border border-[#eeebe6] rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#111] mb-3">Message Sent!</h2>
              <p className="text-[#555] text-sm leading-relaxed">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white border border-[#eeebe6] rounded-2xl p-8 flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#333]">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#333]">Company</label>
                  <input
                    {...register('company')}
                    placeholder="Acme Corp (optional)"
                    className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#333]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#333]">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('subject')}
                  className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all appearance-none"
                >
                  <option value="">Select a subject...</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                  <option value="Quote Request">Quote Request</option>
                  <option value="Account Application">Account Application</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Shipping Question">Shipping Question</option>
                  <option value="Partnership">Partnership Opportunity</option>
                  <option value="Other">Other</option>
                </select>
                {errors.subject && (
                  <p className="text-xs text-red-500">{errors.subject.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#333]">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message')}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  className="w-full px-4 py-3 bg-[#faf9f7] border border-[#e0dbd2] rounded-xl text-sm text-[#222] placeholder:text-[#bbb] outline-none focus:border-[#2b7fff] focus:ring-2 focus:ring-[#2b7fff]/10 transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#111] hover:bg-[#2a2a2a] disabled:opacity-60 text-white rounded-full text-[13px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
