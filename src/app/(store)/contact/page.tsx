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
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-blue">
          Get in Touch
        </p>
        <h1 className="mb-3 text-3xl font-bold text-brand-navy">Contact Us</h1>
        <p className="max-w-xl text-base leading-relaxed text-brand-ink/72">
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
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                <Mail size={18} className="text-brand-blue" />
              </div>
              <div>
                <p className="mb-1 text-[13px] font-bold uppercase tracking-wider text-brand-ink">Email</p>
                <a
                  href="mailto:support@nxgenpharma.com"
                  className="text-sm text-brand-blue transition-opacity hover:opacity-70"
                >
                  support@nxgenpharma.com
                </a>
                <p className="mt-0.5 text-xs text-brand-ink/50">Business inquiries only</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                <Phone size={18} className="text-brand-blue" />
              </div>
              <div>
                <p className="mb-1 text-[13px] font-bold uppercase tracking-wider text-brand-ink">Phone</p>
                <a
                  href="tel:+18444962712"
                  className="text-sm text-brand-blue transition-opacity hover:opacity-70"
                >
                  +1 (844) 496-2712
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                <Clock size={18} className="text-brand-blue" />
              </div>
              <div>
                <p className="mb-1 text-[13px] font-bold uppercase tracking-wider text-brand-ink">
                  Business Hours
                </p>
                <p className="text-sm text-brand-ink/72">Mon – Fri: 9AM – 5PM EST</p>
                <p className="text-sm text-brand-ink/72">Saturday: Delivery available</p>
                <p className="text-sm text-brand-ink/50">Closed on holidays</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-mist">
                <MapPin size={18} className="text-brand-blue" />
              </div>
              <div>
                <p className="mb-1 text-[13px] font-bold uppercase tracking-wider text-brand-ink">
                  Shipping
                </p>
                <p className="text-sm text-brand-ink/72">Orders placed before 12PM EST</p>
                <p className="text-sm text-brand-ink/72">ship the same business day</p>
              </div>
            </div>
          </div>

          {/* Apply CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-6 text-white">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-aqua">
              New Customer?
            </p>
            <h3 className="text-lg font-bold mb-2">Apply for B2B Access</h3>
            <p className="mb-5 text-sm leading-relaxed text-white/72">
              Get access to our full catalog and B2B pricing by applying for an account.
            </p>
            <a
              href="/apply"
              className="inline-block w-full rounded-full bg-white py-3 text-center text-[13px] font-bold text-brand-navy transition-colors hover:bg-brand-mist"
            >
              Apply for an Account
            </a>
          </div>

        </div>

        {/* ── Right: Form ── */}
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="rounded-2xl border border-brand-line bg-white p-12 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h2 className="mb-3 text-xl font-bold text-brand-navy">Message Sent!</h2>
              <p className="text-sm leading-relaxed text-brand-ink/72">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5 rounded-2xl border border-brand-line bg-white p-8"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-brand-ink">Company</label>
                  <input
                    {...register('company')}
                    placeholder="Acme Corp (optional)"
                    className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-ink">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-brand-ink">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('subject')}
                  className="w-full appearance-none rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
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
                <label className="text-[13px] font-medium text-brand-ink">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message')}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-ink outline-none transition-all placeholder:text-brand-ink/35 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
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
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy py-4 text-[13px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-blue disabled:opacity-60"
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
