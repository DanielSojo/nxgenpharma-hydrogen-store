import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-content';
import PageHeader from '@/components/layout/PageHeader';

interface InfoPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/coa', label: 'Certificate of Analysis' },
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
      <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-8 lg:px-10">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
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
      </div>
    </div>
  );
}
