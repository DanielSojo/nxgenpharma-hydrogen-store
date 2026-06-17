import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import CoaSearch from '@/components/store/CoaSearch';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Certificate of Analysis',
  description:
    'Look up and download the Certificate of Analysis (COA) for your NexGen Pharmaceuticals product by entering its lot number.',
};

export default function CoaPage() {
  return (
    <InfoPageShell
      eyebrow="Certificate of Analysis"
      title="Look up your Certificate of Analysis"
      description="Every batch we ship is tested for identity and purity. Enter the lot number from your product label to find and download its Certificate of Analysis."
    >
      <CoaSearch />

      <section className="rounded-2xl border border-brand-line/70 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
        <h2 className="text-lg font-bold text-brand-navy">Where do I find my lot number?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">
          The lot (or batch) number is printed on the product label or vial, typically near the
          expiry date. It usually starts with{' '}
          <span className="font-semibold text-brand-navy">Nexg</span>. If you can&apos;t locate it
          or your certificate isn&apos;t showing up, email{' '}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-semibold text-brand-blue hover:text-brand-navy"
          >
            {siteConfig.supportEmail}
          </a>{' '}
          and our team will help.
        </p>
      </section>
    </InfoPageShell>
  );
}
