import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-content';

interface InfoPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Return Policy' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  children,
}: InfoPageShellProps) {
  return (
    <div className="bg-brand-surface">
      <section className="relative overflow-hidden border-b border-brand-line/60 bg-gradient-to-br from-brand-mist via-white to-brand-surface px-6 py-20">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-aqua/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -top-28 h-64 w-64 rounded-full bg-brand-navy/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="animate-fade-up relative mx-auto max-w-6xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-line/70 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-brand-blue backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
            {eyebrow}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-brand-navy sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-ink/72">
            {description}
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-8">{children}</div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-brand-line/70 bg-white p-6 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.16)]">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-blue">
                Quick Links
              </p>
              <div className="mt-4 flex flex-col gap-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-brand-ink/70 transition-colors hover:bg-brand-mist hover:text-brand-navy"
                  >
                    <ChevronRight size={14} className="text-brand-ink/30 transition-all group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-mist to-brand-surface p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-blue">
                  Contact
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink/72">
                  {siteConfig.shortName}
                  <br />
                  {siteConfig.domain}
                </p>
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="mt-3 inline-block text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
                >
                  {siteConfig.supportEmail}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
