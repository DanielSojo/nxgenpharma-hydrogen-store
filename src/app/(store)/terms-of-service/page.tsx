import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing the use of the NexGen Pharmaceuticals website.',
};

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description={`These terms govern your use of ${siteConfig.domain} and the information, products, and services made available through the website.`}
    >
      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Use of Website</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-brand-ink/76">
          <p>
            By accessing or using {siteConfig.domain}, you agree to use the website only for lawful purposes and in a way that does not infringe on the rights of, restrict, or inhibit the use of the website by any other person.
          </p>
          <p>
            We may update, suspend, or discontinue parts of the website at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of those changes.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Product and Information Use</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-brand-ink/76">
          <p>
            Information provided on this website is for general informational purposes only. It is not intended as medical advice, and it should not replace consultation with a qualified healthcare professional.
          </p>
          <p>
            Product availability, descriptions, and related content may change without notice. Quotes, order reviews, and account approvals are subject to our internal review and business policies.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Limitation of Liability</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          In no event will NexGen Pharmaceuticals be liable for any loss or damage, including without limitation indirect or consequential loss or damage, arising from the use of or reliance on any information presented on this website.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Contact</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          If you have questions about these Terms of Service, contact us at{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}
