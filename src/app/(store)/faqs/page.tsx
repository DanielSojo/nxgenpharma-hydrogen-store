import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import NewsletterCallout from '@/components/content/NewsletterCallout';
import { faqItems, siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Frequently asked questions about NexGen Pharmaceuticals, peptides, shipping, and support.',
};

export default function FAQsPage() {
  return (
    <InfoPageShell
      eyebrow="FAQs"
      title="Answers to common questions"
      description="Find quick answers about peptides, product handling, returns, shipping, and how to get in touch with our team."
    >
      <section className="space-y-4">
        {faqItems.map((item) => (
          <article key={item.question} className="rounded-2xl border border-brand-line bg-white p-7">
            <h2 className="text-lg font-bold text-brand-navy">{item.question}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">{item.answer}</p>
          </article>
        ))}
      </section>

      <NewsletterCallout />

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Still need help?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">
          For additional questions, product inquiries, or support, email us at{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}
