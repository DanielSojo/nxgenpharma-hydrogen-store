import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { faqGroups, siteConfig } from '@/lib/site-content';

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
      {faqGroups.map((group) => (
        <section key={group.category} className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-brand-blue">
            {group.category}
          </h2>
          {group.items.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-brand-line/70 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]"
            >
              <h3 className="text-lg font-bold text-brand-navy">{item.question}</h3>
              {item.answer && (
                <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">{item.answer}</p>
              )}
              {item.bullets && (
                <ul className="mt-3 space-y-2">
                  {item.bullets.map((bullet) => (
                    <li key={bullet.text} className="text-[15px] leading-relaxed text-brand-ink/76">
                      {bullet.label ? (
                        <>
                          <span className="font-semibold text-brand-navy">{bullet.label}:</span>{' '}
                          {bullet.text}
                        </>
                      ) : (
                        <span className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-aqua" />
                          {bullet.text}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {item.close && (
                <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">{item.close}</p>
              )}
            </article>
          ))}
        </section>
      ))}

      <section className="rounded-2xl border border-brand-line/70 bg-white p-8 shadow-[0_2px_12px_-6px_rgba(23,50,82,0.14)]">
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
