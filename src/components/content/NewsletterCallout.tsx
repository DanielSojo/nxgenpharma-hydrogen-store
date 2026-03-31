import { siteConfig } from '@/lib/site-content';

export default function NewsletterCallout() {
  const subject = encodeURIComponent('Newsletter Signup');
  const body = encodeURIComponent('Name:\nEmail:\n\nPlease add me to the NexGen Pharmaceuticals newsletter.');

  return (
    <section className="rounded-3xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-8 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-aqua">
        Stay Informed
      </p>
      <h2 className="mt-3 text-2xl font-bold">Sign up for our newsletter</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/76">
        Join our community and be the first to receive the latest news, product updates, and
        exclusive offers from NexGen Pharmaceuticals.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <input
          aria-label="Your Name"
          placeholder="Your Name"
          readOnly
          className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/45"
        />
        <input
          aria-label="Your Email Address"
          placeholder="Your Email Address"
          readOnly
          className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/45"
        />
      </div>

      <a
        href={`mailto:${siteConfig.supportEmail}?subject=${subject}&body=${body}`}
        className="mt-4 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-mist"
      >
        Subscribe Now
      </a>

      <p className="mt-4 text-xs text-white/62">
        We respect your privacy. Your information will not be shared with third parties.
      </p>
    </section>
  );
}
