import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Website disclaimer and medical disclaimer for NexGen Pharmaceuticals.',
};

export default function DisclaimerPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Disclaimer"
      description="Important information regarding the use of website content, products, services, and limitations of liability."
    >
      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">General Disclaimer</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          The information provided on the NexGen Pharmaceuticals website is for informational purposes only and is not intended as medical advice. While we strive to ensure that the information is accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the information, products, or services contained on the site.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Medical Disclaimer</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          The products and services offered by NexGen Pharmaceuticals are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare professional before starting any new treatment or therapy.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Limitation of Liability</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          In no event will NexGen Pharmaceuticals be liable for any loss or damage, including without limitation indirect or consequential loss or damage, arising from the use of or reliance on any information presented on this website.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Acceptance</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          By using this website, you acknowledge that you have read and understood this disclaimer and agree to its terms. Questions may be directed to{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}
