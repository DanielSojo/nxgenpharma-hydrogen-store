import { siteConfig } from '@/lib/site-content';

export default function NewsletterCallout() {
  const subject = encodeURIComponent('Newsletter Signup');
  const body = encodeURIComponent('Name:\nEmail:\n\nPlease add me to the NexGen Pharmaceuticals newsletter.');

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-ink to-brand-blue p-8 text-white shadow-[0_24px_50px_-24px_rgba(26,29,109,0.6)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-aqua/20 blur-3xl" />
      <p className="relative text-xs font-bold uppercase tracking-[0.28em] text-brand-aqua">
        Stay Informed
      </p>
      <h2 className="relative mt-3 text-2xl font-bold">Sign up for our newsletter</h2>
      <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-white/76">
        Join our community and be the first to receive the latest news, product updates, and
        exclusive offers from NexGen Pharmaceuticals.
      </p>

      <div className="relative mt-6 grid gap-3 md:grid-cols-2">
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
        className="relative mt-4 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-navy shadow-lg shadow-black/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
      >
        Subscribe Now
      </a>

      <p className="relative mt-4 text-xs text-white/62">
        We respect your privacy. Your information will not be shared with third parties.
      </p>
    </section>
  );
}
