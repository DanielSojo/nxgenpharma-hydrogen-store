import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  ClipboardList,
  FileText,
  PackageCheck,
  CircleDollarSign,
  Sparkles,
} from 'lucide-react';
import WhiteLabelFAQ from '@/components/content/WhiteLabelFAQ';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'White Label Program',
  description:
    'Launch your own peptide brand without the complexity of manufacturing. The NexGen Pharma White Label Program lets clinics, practitioners, and businesses offer high-quality lyophilized peptides under their own brand.',
};

const startHref = '/contact';

const standardFeatures = [
  'Custom label design',
  'Two revision rounds included',
  'Order management in the design queue',
  'MOQ: 10 units per SKU',
];

const priorityFeatures = [
  'Everything in Standard',
  '$750 setup fee credited back to your order',
  'Priority placement in the design queue',
  'Priority processing',
];

const orderingSteps = [
  {
    step: 'Step 1',
    body: 'Click the "Start Your White Label" button at the bottom of this page to begin your request.',
  },
  {
    step: 'Step 2',
    body: 'The $750 White Label Setup Fee is confirmed with our team. A secure payment link is sent to your email to complete the one-time setup fee.',
  },
  {
    step: 'Step 3',
    body: 'Once payment is completed, your white label account is activated. You will receive a confirmation email with next steps and your onboarding form.',
  },
];

const artworkCanDo = [
  'Apply your logo and brand name to the label',
  'Customize product name, MG, ML, and core product details',
  'Include required elements',
  'Add storage disclaimers',
  'Add your website and/or QR code (if provided)',
  'Design within a clean, modern label system that aligns with compliance and readability',
  'Incorporate simple background elements or textures (with print limitations in mind)',
  'Match your brand colors as closely as possible in CMYK print',
  'Provide up to 2 rounds of revisions (one consolidated set of changes per round)',
  'Deliver a video proof on our prior to production',
  'Add a re-order QR for COAs (upon request)',
];

const artworkCantDo = [
  "Replicate or closely mimic other brands' label designs, layouts, or branding",
  'Use Pantone spot inks, foils, marks, or proprietary visual elements',
  'Accept screenshots for design elements (must be original source files: AI, SVG, EPS, etc.)',
  'Guarantee fine detail clarity on small labels (micro-details will be lost in print)',
  'Produce metallic finishes (labels are gloss BOPP — "silver" will print as gray)',
  'Match RGB/digital colors exactly (all print is CMYK and may vary slightly)',
  'Provide custom colored caps',
  'Go below 3.6 pt font size for legibility and compliance',
  'Support overly complex or highly detailed artwork that will not reproduce cleanly',
  'Allow ongoing piecemeal revisions (feedback must be consolidated per round)',
  'Proceed with production without final approval',
];

const timeline = [
  {
    day: 'Day 0',
    title: 'Order Confirmed',
    body: 'Setup fee received and processed. Orders of $5,000+ receive priority placement in the design queue.',
    icon: CircleDollarSign,
  },
  {
    day: 'Within 2 business days',
    title: 'Initial Proof Delivered',
    body: 'You receive a video proof via email showing your label on a mock product. Review colors, text, placement, and overall design in order to proceed to production, written approval is required.',
    icon: FileText,
  },
  {
    day: 'If needed',
    title: 'Revision Round',
    body: 'Two revision rounds are included. Each round is one consolidated set of changes. Updated proofs are delivered within the next business day of receiving feedback for that round.',
    icon: ClipboardList,
  },
  {
    day: 'Approval',
    title: 'You Approve the Design',
    body: 'Once approved, artwork is finalized. Internal QC and production begins. Production processing takes up to 3 business days after approval to be ship-ready.',
    icon: Check,
  },
  {
    day: 'Ship day',
    title: 'Order Ships',
    body: 'Production is complete, quality-checked, and shipped. Most orders ship within 5 business days; timelines may vary by order size.',
    icon: PackageCheck,
  },
];

const faqItems = [
  {
    question: 'What is the difference between a NexGen Pharma account and a White Label account?',
    answer:
      'A standard account lets you order products under the NexGen Pharma label. A White Label account lets you sell those same high-quality peptides under your own brand, with custom labeling designed and produced by our team.',
  },
  {
    question: 'What is the minimum order quantity (MOQ)?',
    answer:
      'The minimum order quantity is 10 units per SKU. Orders below this MOQ will not be processed.',
  },
  {
    question: 'How long does the entire process take?',
    answer:
      'Most orders ship within 5 business days of setup fee confirmation, assuming prompt approvals. Revisions and larger order sizes can extend this timeline.',
  },
  {
    question: "What if I need changes after I've already approved?",
    answer:
      'Once you provide written approval, artwork is finalized and production begins. Changes requested after approval require a new $750 setup fee and a new production timeline.',
  },
  {
    question: 'Is the $750 setup fee waived for large orders?',
    answer:
      'Yes. For initial orders of $5,000 or more, the $750 setup fee is credited back to your order and you receive priority placement in the design queue.',
  },
  {
    question: 'Can I submit my own artwork?',
    answer:
      'Yes, provided it is supplied as original, print-ready source files (AI, SVG, EPS). Our team reviews all artwork for compliance and print readiness before production.',
  },
  {
    question: 'Can I repurpose my COAs for my label?',
    answer:
      'Yes. Upon request we can add a re-order QR code that links to the Certificate of Analysis for your products.',
  },
];

function PrimaryCTA({ className = '' }: { className?: string }) {
  return (
    <Link
      href={startHref}
      className="bg-brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
    >
      Start Your White Label
      <ArrowRight size={16} className={className} />
    </Link>
  );
}

export default function WhiteLabelPage() {
  return (
    <div className="bg-brand-surface">
      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden bg-brand-navy px-6 py-24 text-white">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-aqua/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,37,80,0.95),rgba(26,29,109,0.55),rgba(62,151,218,0.35))]" />
        <div className="animate-fade-up relative mx-auto w-full max-w-6xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-aqua backdrop-blur-sm">
            <Sparkles size={13} />
            White Label Program
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Launch your own peptide brand
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/78">
            Offer high-quality lyophilized peptides under your own brand without the complexity of
            manufacturing. The {siteConfig.shortName} White Label Program gives clinics,
            practitioners, and businesses a professional, compliant path to a private-label product
            line.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PrimaryCTA />
            <Link
              href="#program-investment"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Program Investment */}
      <section id="program-investment" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
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
              <p className="mt-3 text-4xl font-bold text-brand-navy">$750.00</p>
              <p className="mt-1 text-sm text-brand-ink/60">One-time setup fee</p>
              <ul className="mt-7 space-y-3">
                {standardFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-brand-ink/76">
                    <Check size={18} className="mt-0.5 flex-none text-brand-aqua" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs text-brand-ink/55">
                $750 setup fee payment required before artwork begins.
              </p>
            </div>

            {/* Priority / $5,000+ Orders */}
            <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)]">
              <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                Most Popular
              </span>
              <p className="text-sm font-semibold text-white/80">$5,000+ Orders</p>
              <p className="mt-3 text-4xl font-bold">$0</p>
              <p className="mt-1 text-sm text-white/75">Setup fee credited to your initial order</p>
              <ul className="mt-7 space-y-3">
                {priorityFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-white/90">
                    <Check size={18} className="mt-0.5 flex-none text-white" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-xs text-white/70">
                $750 setup fee payment required before artwork begins; credited on qualifying orders.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <PrimaryCTA />
          </div>
        </div>
      </section>

      {/* Ordering Process */}
      <section className="bg-brand-mist/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
            Ordering Process
          </h2>
          <p className="mt-4 text-[15px] font-medium text-brand-ink/72">
            Your account setup will commence once the setup fee is processed.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {orderingSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-brand-line/70 bg-white p-6 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                  {item.step}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-brand-ink/76">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertTriangle size={18} className="mt-0.5 flex-none text-red-500" />
            <p className="text-sm leading-relaxed text-red-700">
              You must complete and pay the setup fee before you can place your first product order.
              The setup fee and product orders are separate transactions. Do not place a product
              order before your white label account is activated.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-brand-navy">1. Onboarding Form</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">
                Once your White Label setup fee has been paid and processed, your onboarding form is
                completed and submitted. You will receive a confirmation email and can begin
                selecting products from the catalog or by browsing by category.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-navy">2. Place Your First Order</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">
                Once your White Label setup fee has been paid and processed, you are officially
                approved to place your first order. You can begin selecting products from the catalog
                or by browsing by category.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-bold text-red-600">
              <AlertTriangle size={16} /> MOQ: 10 units per SKU
            </p>
            <p className="mt-1 text-xs text-red-600/80">
              Orders below MOQ will be rejected and start processing.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <PrimaryCTA />
          </div>
        </div>
      </section>

      {/* Artwork Guidelines */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              White Label Artwork Guidelines
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-ink/72">
              To keep your labels clean, compliant, and print-ready, here is exactly what our design
              team can and cannot do.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-aqua/15 text-brand-aqua">
                  <Check size={16} />
                </span>
                What We Can Do
              </h3>
              <ul className="mt-6 space-y-3">
                {artworkCanDo.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-brand-ink/76">
                    <Check size={16} className="mt-0.5 flex-none text-brand-aqua" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <X size={16} />
                </span>
                What We Can&apos;t Do
              </h3>
              <ul className="mt-6 space-y-3">
                {artworkCantDo.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-brand-ink/76">
                    <X size={16} className="mt-0.5 flex-none text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Artwork & Approval Process timeline */}
      <section className="bg-brand-mist/60 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              Artwork &amp; Approval Process
            </h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-blue">
              5 Business Days Total
            </p>
          </div>

          <ol className="relative space-y-8 border-l-2 border-brand-line pl-8">
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="relative">
                  <span className="absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-line bg-white text-brand-blue">
                    <Icon size={15} />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">
                    {item.day}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-brand-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/76">{item.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertTriangle size={18} className="mt-0.5 flex-none text-red-500" />
            <p className="text-sm leading-relaxed text-red-700">
              <span className="font-bold">Changes after approval will attract a $750 new setup fee.</span>{' '}
              Once artwork is approved and production begins, any changes (text, color edits, label
              swaps, logo updates, compliance updates) require a completely new setup fee. Start
              fresh — check everything carefully before approving. Have multiple team members review.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ — dark section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-8 text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)] sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-6">
            <WhiteLabelFAQ items={faqItems} />
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
          <h2 className="text-2xl font-bold text-brand-navy">Terms &amp; Conditions</h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-ink/72">
            By proceeding with the White Label Program, you acknowledge and agree to the following
            terms:
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-relaxed text-brand-ink/72">
            <li>
              <span className="font-semibold text-brand-navy">Setup Fee:</span> The $750 setup fee is
              non-refundable once paid and processed. It is credited toward initial orders totaling
              $5,000 or more.
            </li>
            <li>
              <span className="font-semibold text-brand-navy">Minimum Order Quantity:</span> All
              orders require a minimum of 10 units per SKU. Orders below this minimum will not be
              processed.
            </li>
            <li>
              <span className="font-semibold text-brand-navy">Revisions:</span> Two consolidated
              revision rounds are included. Additional revisions require a new setup fee. All
              revision requests must be consolidated into a single set of changes per round.
            </li>
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24">
        <div className="bg-brand-gradient relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)]">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-brand-aqua/25 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Launch Your Brand?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80">
            Get in touch with our team to start your White Label Program and bring your private-label
            peptide line to market.
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
