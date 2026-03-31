import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-content';

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Return Policy' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-8 bg-brand-navy px-6 py-16 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <Image src="/nxgenpharma-logo.png" width={200} height={100} alt="NxGen Pharma Logo" />
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {siteConfig.slogan}
          </p>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-4 inline-block text-sm font-semibold text-brand-aqua hover:text-white"
          >
            {siteConfig.supportEmail}
          </a>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-aqua">
            Company
          </h4>
          <div className="flex flex-col gap-2">
            {footerLinks.company.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-aqua">
            Legal
          </h4>
          <div className="flex flex-col gap-2">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-aqua">
            Contact
          </h4>
          <p className="text-sm leading-relaxed text-white/65">
            {siteConfig.domain}
            <br />
            {siteConfig.shortName}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Questions, feedback, or support requests are welcome anytime.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-8 text-center text-sm text-white/45">
        © {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.
      </div>
    </footer>
  );
}
