import Link from 'next/link';
import { auth } from '@/lib/auth';
import {
  ArrowRight,
  Beaker,
  ChevronDown,
  FlaskConical,
  ShieldCheck,
  Users,
} from 'lucide-react';

const loginHref = '/login?callbackUrl=/dashboard';
const catalogHref = '/collections/all';

const advantageCards = [
  {
    title: 'Molecular Precision',
    description: 'Targeting clinical needs with carefully sourced peptide products and a focused provider workflow.',
    icon: FlaskConical,
  },
  {
    title: 'Quality Controls',
    description: 'Built for professional purchasing with verified accounts, clear product access, and dependable fulfillment.',
    icon: ShieldCheck,
  },
  {
    title: 'Provider-Focused',
    description: 'A streamlined catalog experience for clinics and healthcare teams managing repeat ordering needs.',
    icon: Users,
  },
];

const faqs = [
  {
    question: 'What are peptides?',
    answer:
      'Peptides are short chains of amino acids that act as signaling molecules in the body and are used across many areas of healthcare and research.',
  },
  {
    question: 'Who can access the NexGen Pharma catalog?',
    answer:
      'Catalog access is reserved for verified professional accounts. New users can apply for access, and approved users can sign in to browse products.',
  },
  {
    question: 'How do I place an order?',
    answer:
      'After logging in, approved users can browse the catalog, review product details, and submit orders or quote requests through the platform.',
  },
  {
    question: 'How should products be stored?',
    answer:
      'Storage requirements vary by product. Please follow the handling and storage guidance provided with each product listing or label.',
  },
  {
    question: 'How can I get support?',
    answer:
      'Sign in to your account to manage orders and quotes, or use the contact options available through the platform for account support.',
  },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <div className="bg-[#faf8ff] text-brand-ink">
      <section className="bg-catalog-hero relative flex min-h-[620px] items-center overflow-hidden px-6 py-24 text-white">
        <video
          className="absolute inset-0 h-full w-full object-fill opacity-50"
          src="/nexgenpharmacy.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <div className="catalog-vignette pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,45,0.88),rgba(8,11,45,0.55)_45%,rgba(8,11,45,0.25))]" />
        <div className="pointer-events-none absolute -bottom-px inset-x-0 h-12 bg-gradient-to-t from-[#faf8ff] to-transparent" />
        <div className="animate-fade-up relative mx-auto w-full max-w-6xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-aqua backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-aqua" />
            Precision Pharmaceutical Innovation
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[4rem]">
            Advancing the Next Generation of Science
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            NexGen Pharma brings peptide-focused supply, provider verification, and professional purchasing tools into one streamlined B2B platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <Link
                href={catalogHref}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Catalog
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href={loginHref}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Provider Login
                <ArrowRight size={16} />
              </Link>
            )}
            {!isLoggedIn && (
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-aqua hover:bg-white/10"
              >
                Apply for Access
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-brand-mist px-3 py-1 text-xs font-semibold text-brand-blue">
              Established 2024
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-brand-navy sm:text-4xl">
              Innovating at the forefront of peptide-based healthcare
            </h2>
            <p className="mt-5 text-lg leading-8 text-brand-ink/72">
              NexGen Pharma is focused on advancing the next generation of science through peptide innovation, personalized therapies, and a commitment to better health outcomes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
            <article className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.18)] transition-all duration-300 hover:shadow-[0_22px_48px_-20px_rgba(23,50,82,0.3)]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGZpVlg8lUpfRQZUwgjAIBg98Ys4EBuc9jRD0GukJ7A2C5WorJD6wJCug18EQa02vFkxJliVSdaYrBXcUJxpvnA1DJ-x0MvD6_Y3V2Myqj8a5LSfLyRMGE2Uya3VGpIYtDqT20jO1B8C9RChKNhVS9Dfc4Mbaa1ib1JGyoEfBGp2WoJ8vOc4BV85JMXwISBaUO31NQj0SkKWzGJ7sn_JoBzpLfsoFZz8Nf7TTz7yUsOeoZf3EGmun-mT3Dq5z88zcpjffgduP-ys4J"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-[0.12] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="relative flex h-full max-w-2xl flex-col justify-end">
                <h3 className="text-2xl font-semibold text-brand-navy">Who We Are</h3>
                <p className="mt-4 leading-7 text-brand-ink/72">
                  We are a team dedicated to making professional pharmaceutical purchasing more focused, secure, and efficient for healthcare providers.
                </p>
              </div>
            </article>

            <article className="bg-catalog-hero relative flex min-h-[360px] flex-col justify-center overflow-hidden rounded-2xl p-8 text-white shadow-[0_22px_48px_-22px_rgba(26,29,109,0.55)]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-aqua/20 blur-2xl" />
              <Beaker className="relative mb-6 text-brand-aqua" size={44} />
              <h3 className="relative text-2xl font-semibold">Our Mission</h3>
              <p className="relative mt-4 leading-7 text-white/76">
                To support provider access to peptide-focused products through a trusted platform designed for clarity, verification, and clinical professionalism.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#eef4ff] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold text-brand-navy">The NexGen Advantage</h2>
          <p className="mx-auto mt-4 max-w-2xl text-brand-ink/70">
            Precision-engineered platform tools for a more efficient professional ordering experience.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {advantageCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-2xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.18)] transition-all duration-200 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_22px_48px_-20px_rgba(23,50,82,0.3)]"
              >
                <div className="bg-brand-gradient mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md shadow-brand-blue/25 transition-transform duration-200 group-hover:scale-105">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-brand-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-ink/68">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.35fr]">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-brand-navy">Frequently Asked Questions</h2>
            <p className="mt-4 leading-7 text-brand-ink/70">
              Answers for providers getting started with NexGen Pharma.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-brand-line/70 bg-white shadow-[0_2px_10px_-6px_rgba(23,50,82,0.16)] transition-colors open:border-brand-blue/30 hover:border-brand-blue/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-semibold text-brand-navy">
                  {faq.question}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-mist text-brand-blue transition-transform group-open:rotate-180">
                    <ChevronDown size={16} />
                  </span>
                </summary>
                <p className="border-t border-brand-line/70 px-5 py-4 leading-7 text-brand-ink/70">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="bg-catalog-hero relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-16 text-center text-white shadow-[0_30px_70px_-30px_rgba(26,29,109,0.6)] sm:px-10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-aqua/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-blue/30 blur-3xl" />
          <h2 className="relative text-3xl font-semibold leading-tight">
            Ready to access the professional catalog?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/76">
            {isLoggedIn
              ? 'Continue to the catalog to browse products, manage quotes, and use the provider experience.'
              : 'Sign in to browse products, manage quotes, and continue through the verified provider experience.'}
          </p>
          {isLoggedIn ? (
            <Link
              href={catalogHref}
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Browse Catalog
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href={loginHref}
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Go to Login
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
