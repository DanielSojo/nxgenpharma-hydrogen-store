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

const loginHref = '/login?callbackUrl=/collections/all';
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
    question: 'Who can access the NxGen Pharma catalog?',
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
      <section className="relative flex min-h-[620px] items-center overflow-hidden bg-brand-navy px-6 py-24 text-white">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1qHSraPg15tUPNZBI7gubhf6HiPUlDjshBwS7nVzDvP7lkAUsUhzeCLAnxWuZrz97QsidkjkPgZEgRnmNvHXf4X7vALMOow3KJ7JmibZix6SNi6XRfp1ltoesQxVqwcZpZesAz_LtD92KxwlzYtNpDc1vzNRvE5_nkQEguNX4UlUu_Hj-TVB9Gp471oualHnKXmqbHP1436cx5zgM0ciFkR4KCNEyySSEvKmE65ZgrtnPa-FaruvASUUeB0jQVT3GvA7TS0Kg_xO-"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,37,80,0.92),rgba(26,29,109,0.62),rgba(15,37,80,0.72))]" />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-aqua">
            Precision Pharmaceutical Innovation
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Advancing the Next Generation of Science
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            NxGen Pharma brings peptide-focused supply, provider verification, and professional purchasing tools into one streamlined B2B platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <Link
                href={catalogHref}
                className="inline-flex items-center gap-2 rounded bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-mist"
              >
                Browse Catalog
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                href={loginHref}
                className="inline-flex items-center gap-2 rounded bg-white px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-mist"
              >
                Provider Login
                <ArrowRight size={16} />
              </Link>
            )}
            {!isLoggedIn && (
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded border border-white/35 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-brand-aqua hover:bg-white/10"
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
              NxGen Pharma is focused on advancing the next generation of science through peptide innovation, personalized therapies, and a commitment to better health outcomes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
            <article className="relative min-h-[360px] overflow-hidden rounded-lg border border-brand-line bg-white p-8">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGZpVlg8lUpfRQZUwgjAIBg98Ys4EBuc9jRD0GukJ7A2C5WorJD6wJCug18EQa02vFkxJliVSdaYrBXcUJxpvnA1DJ-x0MvD6_Y3V2Myqj8a5LSfLyRMGE2Uya3VGpIYtDqT20jO1B8C9RChKNhVS9Dfc4Mbaa1ib1JGyoEfBGp2WoJ8vOc4BV85JMXwISBaUO31NQj0SkKWzGJ7sn_JoBzpLfsoFZz8Nf7TTz7yUsOeoZf3EGmun-mT3Dq5z88zcpjffgduP-ys4J"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
              />
              <div className="relative flex h-full max-w-2xl flex-col justify-end">
                <h3 className="text-2xl font-semibold text-brand-navy">Who We Are</h3>
                <p className="mt-4 leading-7 text-brand-ink/72">
                  We are a team dedicated to making professional pharmaceutical purchasing more focused, secure, and efficient for healthcare providers.
                </p>
              </div>
            </article>

            <article className="flex min-h-[360px] flex-col justify-center rounded-lg border border-brand-navy bg-brand-navy p-8 text-white">
              <Beaker className="mb-6 text-brand-aqua" size={44} />
              <h3 className="text-2xl font-semibold">Our Mission</h3>
              <p className="mt-4 leading-7 text-white/76">
                To support provider access to peptide-focused products through a trusted platform designed for clarity, verification, and clinical professionalism.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#eef4ff] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold text-brand-navy">The NxGen Advantage</h2>
          <p className="mx-auto mt-4 max-w-2xl text-brand-ink/70">
            Precision-engineered platform tools for a more efficient professional ordering experience.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {advantageCards.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-lg border border-brand-line bg-white p-8">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-brand-line text-brand-blue">
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
              Answers for providers getting started with NxGen Pharma.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-lg border border-brand-line bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-semibold text-brand-navy">
                  {faq.question}
                  <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={18} />
                </summary>
                <p className="border-t border-brand-line px-5 py-4 leading-7 text-brand-ink/70">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-lg bg-brand-ink px-6 py-14 text-center text-white sm:px-10">
          <h2 className="text-3xl font-semibold leading-tight">
            Ready to access the professional catalog?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/76">
            {isLoggedIn
              ? 'Continue to the catalog to browse products, manage quotes, and use the provider experience.'
              : 'Sign in to browse products, manage quotes, and continue through the verified provider experience.'}
          </p>
          {isLoggedIn ? (
            <Link
              href={catalogHref}
              className="mt-8 inline-flex items-center gap-2 rounded bg-brand-blue px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-teal"
            >
              Browse Catalog
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href={loginHref}
              className="mt-8 inline-flex items-center gap-2 rounded bg-brand-blue px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-teal"
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
