export const siteConfig = {
  name: 'NexGen Pharmaceuticals',
  shortName: 'NexGen Pharma',
  domain: 'nxgenpharma.com',
  supportEmail: 'support@nxgenpharma.com',
  slogan: 'Advancing the Next Generation of Science',
};

export const aboutContent = {
  intro:
    "Welcome to NexGen Pharmaceuticals where peptides are redefining the future of healthcare. As leaders in peptide therapeutics, we're committed to developing innovative solutions that address today's most pressing health challenges.",
  body:
    'Our cutting-edge research focuses on harnessing the power of peptides to create effective, personalized therapies. We believe peptides are the key to unlocking new treatment possibilities, transforming the way we approach health and wellness.',
  close:
    "Join us as we lead the charge in this exciting new frontier of medicine. At NexGen Pharmaceuticals, we're not just following trends; we're setting them.",
  mission:
    'At NexGen Pharmaceuticals, our mission is to leverage the transformative potential of peptides to deliver groundbreaking healthcare solutions. We are committed to developing effective, personalized therapies that improve patient outcomes and reshape the treatment landscape. With a focus on innovation and excellence, we aim to lead the charge in peptide-based medicine, making a significant impact on health and wellness across the globe.',
};

export type FaqItem = {
  question: string;
  /** Intro paragraph. */
  answer?: string;
  /** Optional bulleted list rendered after the intro paragraph. */
  bullets?: { label?: string; text: string }[];
  /** Optional closing paragraph rendered after the bullets. */
  close?: string;
};

export type FaqGroup = {
  category: string;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    category: 'Product Quality & Standards',
    items: [
      {
        question: 'What quality standards do your products follow?',
        answer:
          'Our products are sourced with a strong emphasis on quality, purity, and consistency. We work with carefully selected manufacturing partners and utilize independent third-party laboratory testing to support product identity, purity, and overall quality.',
      },
      {
        question: 'Are your products tested for quality?',
        answer:
          'Yes. Quality assurance is a key part of our process. We use third-party testing, batch consistency verification, and quality control measures to support product reliability and integrity.',
      },
      {
        question: 'Do you provide COAs or testing documentation?',
        answer:
          'Yes. Certificates of Analysis and related testing documentation may be available for select products upon request. Our team can assist with product-specific documentation where available.',
      },
    ],
  },
  {
    category: 'Professional Use & Ordering',
    items: [
      {
        question: 'Who can order from NexGen?',
        answer:
          'NexGen works with licensed healthcare professionals, clinics, and wellness practices. Access to certain products and pricing may require account approval and credential verification.',
      },
      {
        question: 'Are these products intended for personal use?',
        answer:
          'No. Our products are intended for professional use within a clinical or provider setting and should be handled by qualified healthcare professionals in accordance with their own clinical judgment and applicable regulations.',
      },
      {
        question: 'Do I need to be a licensed provider or clinic to place an order?',
        answer:
          'Certain products and account access may be limited to approved professional accounts. If you are interested in opening a provider account, our team can assist with the verification and onboarding process.',
      },
      {
        question: 'Do you provide dosing or administration guidance?',
        answer:
          'We provide general product information and specifications; however, dosing, administration, and treatment decisions should always be determined by a qualified healthcare professional.',
      },
      {
        question: 'Do you offer white-labeling?',
        answer:
          'Yes. We offer white-labeling options for qualified clinics and businesses seeking a more customized product experience. For more information, please refer to the White Labeling section of our website.',
      },
    ],
  },
  {
    category: 'Storage & Handling',
    items: [
      {
        question: 'How should products be stored?',
        answer: 'Proper storage is important for maintaining product integrity and stability.',
        bullets: [
          {
            label: 'Before reconstitution',
            text: 'Store lyophilized products in a cool, dry place away from direct sunlight, heat, and excess moisture.',
          },
          {
            label: 'After reconstitution',
            text: 'Refrigerate at 2–8°C (36–46°F) unless otherwise directed.',
          },
          {
            label: 'Handling',
            text: 'Avoid repeated temperature fluctuations and follow appropriate storage practices to help preserve product quality.',
          },
        ],
      },
    ],
  },
  {
    category: 'Orders & Shipping',
    items: [
      {
        question: 'Where do you ship from?',
        answer:
          'Orders are fulfilled from within the United States for efficient domestic processing and delivery.',
      },
      {
        question: 'Where do you ship to?',
        answer:
          'At this time, we primarily ship within the United States. If you have questions regarding shipping availability, please contact our team before placing an order.',
      },
      {
        question: 'How long does order processing take?',
        answer:
          'Orders are typically processed within 24 business hours of payment confirmation. Once shipped, delivery generally takes 2–5 business days, depending on destination and carrier transit times.',
      },
      {
        question: 'Are orders packaged securely and discreetly?',
        answer:
          'Yes. Orders are packaged with care to help protect product integrity during transit while maintaining a professional and discreet presentation.',
      },
      {
        question: 'How are products protected during shipping?',
        answer:
          'Products are packaged appropriately for transit to help preserve their condition upon arrival. Packaging methods may vary based on product type, season, and shipping requirements.',
      },
    ],
  },
  {
    category: 'Payments & Order Policies',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We currently accept the following payment methods for approved orders:',
        bullets: [
          { text: 'Credit and debit card payments' },
          { text: 'ACH bank transfers' },
          { text: 'Zelle' },
          { text: 'Wire transfers' },
          { text: 'Checks' },
        ],
        close:
          'All payments are processed through secure, encrypted channels to help protect your information.',
      },
      {
        question: 'Can I cancel my order?',
        answer:
          'If your order has not yet been processed for fulfillment, we may be able to assist with cancellation requests. Because fulfillment begins quickly, we recommend contacting our team as soon as possible if changes are needed.',
      },
      {
        question: 'Do you offer refunds or returns?',
        answer:
          'Due to the nature of our products, returns are generally not accepted once an order has been processed and shipped. If there is an issue with your order upon arrival, please contact us promptly so our team can review the matter and determine the appropriate resolution.',
      },
      {
        question: 'What should I do if there is an issue with my order?',
        answer:
          'If you experience an issue with your order, please contact our team as soon as possible with your order details. We will review the situation and work with you to address verified order or shipping concerns as appropriate.',
      },
    ],
  },
  {
    category: 'Provider Accounts',
    items: [
      {
        question: 'How do I open a provider account?',
        answer:
          'If you are a licensed clinic, medical practice, or qualified healthcare provider interested in working with NexGen, please contact us or complete the provider application through our website. Our team will review your information and follow up regarding next steps.',
      },
      {
        question: 'Do you offer pricing for clinics and larger-volume orders?',
        answer:
          'Yes. We offer tiered pricing and volume-based options for approved clinics and professional accounts. Please contact our team directly to discuss your practice’s needs.',
      },
    ],
  },
];
