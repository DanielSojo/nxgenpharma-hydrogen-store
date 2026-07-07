import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://nxgenpharma.com'),
  title: {
    default: 'NexGen Pharma | B2B Platform',
    template: '%s | NexGen Pharma',
  },
  description: 'Professional B2B pharmaceutical supply platform.',
  openGraph: {
    title: 'NexGen Pharma | B2B Platform',
    description: 'Professional B2B pharmaceutical supply platform.',
    url: 'https://nxgenpharma.com',
    siteName: 'NexGen Pharma',
    type: 'website',
    images: [
      {
        url: '/nxgenpharma-logo.png',
        width: 512,
        height: 512,
        alt: 'NexGen Pharma',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexGen Pharma | B2B Platform',
    description: 'Professional B2B pharmaceutical supply platform.',
    images: ['/nxgenpharma-logo.png'],
  },
  icons: {
    icon: [
      { url: '/nxgenpharma-logo.png', sizes: 'any' },
      { url: '/nxgenpharma-logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/nxgenpharma-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/nxgenpharma-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
