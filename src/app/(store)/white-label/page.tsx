import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Sparkles,
  MessageSquare,
  ClipboardCheck,
  BadgeCheck,
  PackageCheck,
} from 'lucide-react';
import { siteConfig } from '@/lib/site-content';
import PageHeader from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'White Labeling',
  description:
    'Build your brand with confidence. NexGen offers white-labeling solutions for qualified clinics, wellness practices, and healthcare businesses looking to create a more customized product experience under their own brand.',
};

const startHref = '/contact';

const whoFor = [
  'Wellness clinics',
  'Medical practices',
  'Aesthetic providers',
  'Concierge health practices',
  'Businesses looking to develop a branded wellness product line',
];

const customizations = [
  'Custom product labels featuring your business name and branding',
  'A more cohesive branded presentation for your products',
  'Support in building a professional in-house product line',
  'A more elevated client-facing product experience',
];

const processSteps = [
  {
    step: 'Step 1',
    title: 'Initial Consultation',
    body: `We begin by learning more about your clinic, business goals, and the type of products you're interested in offering under your brand.`,
    icon: MessageSquare,
  },
  {
    step: 'Step 2',
    title: 'Product & Branding Review',
    body: 'Our team will review eligible product options, discuss white-label availability, and go over any branding requirements needed to move forward.',
    icon: ClipboardCheck,
  },
  {
    step: 'Step 3',
    title: 'Account Approval & Order Planning',
    body: `Once approved, we'll work with you on product selection, order details, and next steps for launching your branded line.`,
    icon: BadgeCheck,
  },
  {
    step: 'Step 4',
    title: 'Production & Fulfillment',
    body: 'After final approval of labeling and order details, your products will move into fulfillment according to the agreed production timeline.',
    icon: PackageCheck,
  },
];

const standardFeatures = [
  'Custom label design',
  'Two revision rounds included',
  'Order management for orders under $5,000',
  'MOQ: 10 units per SKU',
];

const priorityFeatures = [
  'Everything included in Standard Setup',
  '$850 credit applied to the initial order',
  'Priority placement in the design queue',
  'Priority processing',
];

const importantNotes = [
  'White-labeling is available to approved professional accounts only',
  'Availability may vary based on product type, quantity, and packaging format',
  'Minimum order requirements may apply depending on the scope of the project',
  'Production timelines may vary based on design approval, order volume, and inventory availability',
];

function PrimaryCTA({ className = '' }: { className?: string }) {
  return (
    <Link
      href={startHref}
      className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
    >
      Start Your Application
      <ArrowRight size={16} className={className} />
    </Link>
  );
}

export default function WhiteLabelPage() {
  return (
    <div className="bg-brand-surface">
      {/* Hero */}
      <section className="px-5 pt-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <PageHeader
            eyebrow="White Labeling"
            title="Build Your Brand With Confidence"
            icon={Sparkles}
            description={`${siteConfig.shortName} offers white-labeling solutions for qualified clinics, wellness practices, and healthcare businesses looking to create a more customized product experience under their own brand.`}
          />
          <div className="-mt-2 mb-2 max-w-3xl">
            <p className="text-[15px] leading-relaxed text-brand-ink/72">
              Whether you&apos;re expanding an existing practice or launching a new concept, our
              white-label program is designed to provide a streamlined path to professionally branded
              products while maintaining a polished and cohesive brand presence.
            </p>
          </div>
          <div className="mt-6 mb-2 flex flex-wrap items-center gap-4">
            <PrimaryCTA />
            <Link
              href="#program-investment"
              className="inline-flex items-center gap-2 rounded-full border border-brand-line px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-blue/40 hover:bg-brand-mist"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* What Is White Labeling? */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            What Is White Labeling?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/76">
            White labeling allows approved clients to offer select products under their own business
            name and branding rather than {siteConfig.shortName}&apos;s. This gives clinics and
            businesses the opportunity to create a more personalized brand experience while leveraging{' '}
            {siteConfig.shortName}&apos;s sourcing, support, and fulfillment infrastructure.
          </p>
        </div>
      </section>

      {/* Who Is White Labeling For? */}
      <section className="bg-brand-mist/60 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Who Is White Labeling For?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/76">
            Our white-label program is ideal for:
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {whoFor.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-brand-line/70 bg-white p-4 text-sm text-brand-ink/76 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]"
              >
                <Check size={18} className="mt-0.5 flex-none text-brand-aqua" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What Can Be Customized? */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            What Can Be Customized?
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/76">
            Depending on the product and order volume, white-label options may include:
          </p>
          <ul className="mt-6 space-y-3">
            {customizations.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-brand-ink/76">
                <Check size={18} className="mt-0.5 flex-none text-brand-aqua" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-brand-ink/70">
            White-label availability may vary depending on product type, packaging requirements, and
            order size.
          </p>
        </div>
      </section>

      {/* How the Process Works */}
      <section className="bg-brand-mist/60 px-6 py-20">
        <div className="mx-auto max-w-[1480px]">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            How the Process Works
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-brand-line/70 bg-white p-6 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]"
                >
                  <span className="bg-brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md shadow-brand-blue/25">
                    <Icon size={20} />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                    {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-brand-navy">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/76">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Program Investment */}
      <section id="program-investment" className="px-6 py-20">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Program Investment
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-ink/72">
              A transparent, one-time setup fee covers your custom label design. For larger initial
              orders, that fee is credited back to you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Standard Setup */}
            <div className="rounded-3xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
              <p className="text-sm font-semibold text-brand-ink/70">Standard Setup</p>
              <p className="mt-3 text-4xl font-bold text-brand-navy">$850</p>
              <p className="mt-1 text-sm text-brand-ink/70">One-time setup fee</p>
              <p className="mt-4 text-sm leading-relaxed text-brand-ink/76">
                Designed for clinics and businesses looking to launch a white-label program with a
                streamlined setup process.
              </p>
              <ul className="mt-7 space-y-3">
                {standardFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-brand-ink/76">
                    <Check size={18} className="mt-0.5 flex-none text-brand-aqua" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs text-brand-ink/70">
                $850 setup fee payment is required before artwork begins.
              </p>
            </div>

            {/* $5,000+ Orders */}
            <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)]">
              <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                Best Value
              </span>
              <p className="text-sm font-semibold text-white/80">$5,000+ Orders</p>
              <p className="mt-3 text-4xl font-bold">$0</p>
              <p className="mt-1 text-sm text-white/75">Setup fee credited to initial order</p>
              <p className="mt-4 text-sm leading-relaxed text-white/85">
                Ideal for larger launch orders seeking added value and priority support.
              </p>
              <ul className="mt-7 space-y-3">
                {priorityFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-white/90">
                    <Check size={18} className="mt-0.5 flex-none text-white" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs text-white/70">
                $850 setup fee payment is required before artwork begins and will be credited toward
                the initial qualifying order.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <PrimaryCTA />
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="bg-brand-mist/60 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Important Notes
          </h2>
          <ul className="mt-8 space-y-4">
            {importantNotes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-3 rounded-2xl border border-brand-line/70 bg-white p-5 text-sm leading-relaxed text-brand-ink/76 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]"
              >
                <Check size={18} className="mt-0.5 flex-none text-brand-aqua" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ready to Get Started? */}
      <section className="px-6 py-24">
        <div className="bg-catalog-hero relative mx-auto max-w-[1480px] overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)]">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-brand-aqua/25 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            If you&apos;re interested in launching a white-label program with {siteConfig.shortName},
            we&apos;d be happy to learn more about your business and walk you through the process.
            Please contact our team or submit an inquiry through our website to begin your white-label
            application.
          </p>
          <Link
            href={startHref}
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-navy shadow-lg shadow-black/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
