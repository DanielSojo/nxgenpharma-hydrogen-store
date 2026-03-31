import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy information for visitors and customers of NexGen Pharmaceuticals.',
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description={`This page explains how ${siteConfig.shortName} may collect, use, and protect information submitted through ${siteConfig.domain}.`}
    >
      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Information We Collect</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          We may collect information you voluntarily provide through contact forms, account applications, quote requests, login flows, and order-related interactions. This information may include your name, email address, business information, shipping details, and other details necessary to respond to your request.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <h2 className="text-2xl font-bold text-brand-navy">How We Use Information</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-brand-ink/76">
          <p>We may use submitted information to respond to inquiries, process applications, manage quotes and orders, improve website operations, and communicate with you about products or services.</p>
          <p>We do not sell your personal information. We may share information with service providers or platforms involved in operating the website, processing transactions, or providing customer support when necessary.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Data Security and Retention</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          We take reasonable steps to protect the information submitted through our website. However, no method of transmission over the internet or electronic storage is completely secure. We retain information only for as long as needed for operational, legal, or customer support purposes.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Contact</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          If you have privacy questions or would like to contact us about information submitted through this website, email{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}
