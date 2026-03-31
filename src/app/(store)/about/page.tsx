import type { Metadata } from 'next';
import InfoPageShell from '@/components/content/InfoPageShell';
import { aboutContent, siteConfig } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about NexGen Pharmaceuticals, our mission, and our vision.',
};

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="About Us"
      title="Innovating at the forefront of peptide-based healthcare"
      description={`${siteConfig.shortName} is focused on advancing the next generation of science through peptide innovation, personalized therapies, and a commitment to better health outcomes.`}
    >
      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <h2 className="text-2xl font-bold text-brand-navy">Who We Are</h2>
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-brand-ink/76">
          <p>{aboutContent.intro}</p>
          <p>{aboutContent.body}</p>
          <p>{aboutContent.close}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-line bg-brand-mist p-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">Our Mission</p>
        <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/76">
          {aboutContent.mission}
        </p>
      </section>

      <section className="rounded-2xl border border-brand-line bg-white p-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-blue">Slogan</p>
        <h2 className="mt-3 text-3xl font-bold text-brand-navy">{siteConfig.slogan}</h2>
      </section>
    </InfoPageShell>
  );
}
