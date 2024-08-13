import type { Metadata } from 'next';

import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';

const fontInter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title:
    "IndusLens | Chronicling cutting-edge global perspectives on India's success stories",
  description:
    'Explore India&#x27;s vibrant journey to 2050 as a global economic powerhouse, guided by insightful global perspectives on its innovative entrepreneurship, tech revolution, pivotal policies and its dazzling soft power.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'bg-white text-black min-h-screen font-sans antialiased',
          fontInter.variable
        )}
      >
        <Navbar />
        <main className="relative bg-inherit">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
