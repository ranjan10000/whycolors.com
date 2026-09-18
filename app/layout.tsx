// app/layout.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ColorProvider } from '@/context/ColorContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'WhyColors - Explore Every Color Shade & Palette',
  description:
    'Find the perfect color codes for your next project. Our color tools include a powerful color picker, interactive color wheel, detailed color chart, and complete HTML color names reference. Get Hex, RGB, HSL, and OKLCH values instantly. Start picking colors today!',
  other: {
    'google-adsense-account': 'ca-pub-2253099061976861',
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ✅ AdSense in <head> — same as Solvezi */}
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link
          rel="preconnect"
          href="https://pagead2.googlesyndication.com"
        />
        {process.env.NODE_ENV === 'production' && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2253099061976861"
            crossOrigin="anonymous"
          ></script>
        )}
      </head>

      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {/* ✅ Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6QBRT1WGDP"
          strategy="afterInteractive"
          id="gtag-script"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6QBRT1WGDP');
          `}
        </Script>

        <ThemeProvider>
          <ColorProvider>
            <div className="min-h-screen flex flex-col bg-white dark:bg-[#090911] transition-colors duration-300">
              <Suspense fallback={<div className="h-16 sm:h-20" />}>
                <Header />
              </Suspense>

              <main className="flex-1">
                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </main>

              <Suspense fallback={<div className="h-20" />}>
                <Footer />
              </Suspense>
            </div>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}