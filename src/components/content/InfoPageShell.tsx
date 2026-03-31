import Link from 'next/link';
import type { ReactNode } from 'react';
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
      <section className="border-b border-brand-line/80 bg-gradient-to-br from-brand-mist via-white to-brand-surface px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-brand-navy">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-ink/72">
            {description}
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-8">{children}</div>

          <aside className="h-fit rounded-2xl border border-brand-line bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-blue">
              Quick Links
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-brand-ink/70 transition-colors hover:text-brand-navy"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-brand-mist p-5">
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
                className="mt-3 inline-block text-sm font-semibold text-brand-navy hover:text-brand-blue"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
