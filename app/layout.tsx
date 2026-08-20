import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ColorProvider } from '@/context/ColorContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhyColors - Explore Every Color Shade & Palette',
  description: 'Find the perfect color codes for your next project. Our color tools include a powerful color picker, interactive color wheel, detailed color chart, and complete HTML color names reference. Get Hex, RGB, HSL, and OKLCH values instantly. Start picking colors today!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* ✅ ThemeProvider must wrap everything that uses theme */}
        <ThemeProvider>
          <ColorProvider>
            <div className="min-h-screen flex flex-col bg-white dark:bg-[#090911] transition-colors duration-300">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}