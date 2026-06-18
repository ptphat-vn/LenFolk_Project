import type { Metadata } from 'next';
import { Roboto, Lora, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LenFolk',
  description: 'LenFolk',
};

import { Toaster } from '@/components/ui/sonner';
import { ScrollToTop } from '@/components/ScrollToTop';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${lora.variable} ${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-(--font-roboto)">
        <ScrollToTop />
        {children}
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}
