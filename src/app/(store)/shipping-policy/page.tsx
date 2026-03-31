import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping information for NexGen Pharmaceuticals orders.',
};

const shippingItems = [
  {
    title: 'Processing Time',
    body:
      'Orders are typically processed within 1 to 3 business days. You will receive a confirmation email once your order has been shipped.',
  },
  {
    title: 'Shipping Methods and Delivery Times',
    body:
      'Standard shipping typically takes 5 to 7 business days. Expedited shipping typically takes 2 to 3 business days. International shipping times vary by destination and are usually between 7 and 21 business days.',
  },
  {
    title: 'Shipping Costs',
    body:
      'Shipping costs are calculated at checkout based on your location and the shipping method selected.',
  },
  {
    title: 'International Shipping',
    body:
      'We offer international shipping to select countries. Customs duties, taxes, and import fees may apply and are the responsibility of the customer.',
  },
  {
    title: 'Order Tracking',
    body:
      'Once your order has shipped, you will receive a tracking number by email so you can monitor delivery progress.',
  },
  {
    title: 'Lost or Damaged Orders',
    body:
      'If your order is lost or damaged during shipping, please contact support@nxgenpharma.com within 7 days of receiving your order so we can help resolve the issue.',
  },
];

export default function ShippingPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Shipping Policy"
      description="Shipping details, processing timelines, and support information for domestic and international orders."
    >
      <section className="grid gap-4">
        {shippingItems.map((item) => (
          <article key={item.title} className="rounded-2xl border border-brand-line bg-white p-7">
            <h2 className="text-lg font-bold text-brand-navy">{item.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/76">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Contact Us</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          If you have questions regarding shipping or your order, please reach out to{' '}
          <a href={`mailto:${siteConfig.supportEmail}`} className="font-semibold text-brand-blue hover:text-brand-navy">
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </InfoPageShell>
  );
}
