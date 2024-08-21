import './globals.css';

import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cn } from '@/lib/utils';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Inter } from 'next/font/google';
import StickyFollowTwitter from '@/components/StickyFollowTwitter';

const fontInter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff"></meta>
      <meta
        name="google-site-verification"
        content="OvkxrsgjLC5XnaLkznyClyTU9LNs6GuM6mCvqG0EZHA"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <GoogleAnalytics gaId="G-F0MR28LK7H" />
      <body
        className={cn(
          'min-h-screen bg-white font-sans text-black antialiased',
          fontInter.variable,
        )}
      >
        <Navbar />
        <main className="relative bg-inherit">{children}</main>
        <StickyFollowTwitter />
        <Footer />
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 2000,
            style: {
              background: '#363636',
              color: '#fff',
            },

            // Default options for specific types
            success: {
              style: {
                background: '#4caf50',
              },
            },
            error: {
              style: {
                background: 'red',
              },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
