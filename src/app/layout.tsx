import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'NxGen Pharma | B2B Platform',
    template: '%s | NxGen Pharma',
  },
  description: 'Professional B2B pharmaceutical supply platform.',
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
