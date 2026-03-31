import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Return Policy',
  description: 'Return policy information for NexGen Pharmaceuticals orders.',
};

export default function RefundPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Return Policy"
      description="We prioritize customer satisfaction while maintaining strict handling standards for peptide-related products."
    >
      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Returns</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          At NexGen Pharmaceuticals, we prioritize your satisfaction. However, due to the nature of our products, we have specific guidelines regarding returns.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Opened or Reconstituted Products</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          Once a product has been opened or reconstituted, we cannot accept returns. This policy helps protect the integrity, safety, and quality of our products.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Need Help?</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          If you have questions or concerns about your order, contact us at{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          . We&apos;re here to help.
        </p>
      </section>
    </InfoPageShell>
  );
}
