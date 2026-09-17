// app/shades/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import {
  getColorName,
  isValidHex,
  sanitizeHex,
  getColorFamily,
  hexToRgb,
} from '@/lib/color-utils';
import ShadesClient from '@/components/shades/ShadesClient';
import SocialShare from '@/components/color/SocialShare';

interface ShadesPageProps {
  params: Promise<{ hex: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export default async function ShadesPage({ params }: ShadesPageProps) {
  const { hex } = await params;

  const sanitized = sanitizeHex(hex);
  if (!sanitized) notFound();

  const cleanHex = sanitized.toLowerCase();
  if (!isValidHex(cleanHex)) notFound();

  try {
    const rgb = hexToRgb(cleanHex);
    if (!rgb) notFound();
  } catch {
    notFound();
  }

  // Server-computed values
  const colorName = getColorName(cleanHex) || 'Color';
  const colorFamily = getColorFamily(cleanHex) || 'Color';
  const fullHex = `#${cleanHex.toUpperCase()}`;

  return (
    // ✅ FIX 1: Added background — matches all other pages dark bg
    <div className="min-h-screen bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        {/* ============================================================
            BREADCRUMB + SOCIAL SHARE ROW
            Breadcrumb is server-rendered (SEO).
            SocialShare is a client component (interactive).
        ============================================================ */}
        <nav
          className="flex items-center justify-between gap-2 text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400"
          aria-label="Breadcrumb"
        >
          {/* Left: Breadcrumb — server-rendered */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/"
              className="transition-colors flex items-center gap-1.5 p-1 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden xs:inline">Home</span>
            </Link>

            <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            />

            <Link
              href="/shades"
              className="transition-colors p-1 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5"
            >
              Shades
            </Link>

            <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            />

            {/* Hex pill with ids for client-side updates */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-white"
              aria-current="page"
            >
              <span
                id="shades-breadcrumb-dot"
                className="w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300"
                style={{ backgroundColor: fullHex }}
                aria-hidden="true"
              />
              <span
                id="shades-breadcrumb-hex"
                className="font-mono text-[10px] sm:text-xs"
              >
                {fullHex}
              </span>
            </div>
          </div>

          {/* Right: SocialShare — client-rendered */}
          {/*
            ✅ FIX 2: Removed hardcoded isDark={false}
            SocialShare now reads theme via useTheme() internally.
          */}
          <div className="flex-shrink-0">
            <SocialShare hex={cleanHex} colorName={colorName} />
          </div>
        </nav>

        {/* ============================================================
            SERVER-RENDERED H1
        ============================================================ */}
        <h1
          id="shades-h1"
          className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Shades of <span id="shades-h1-name">{colorName}</span>
          <span
            id="shades-h1-hex"
            className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400"
          >
            {fullHex}
          </span>
        </h1>
      </div>

      {/* Client component — interactive part only */}
      <ShadesClient
        colorName={colorName}
        colorFamily={colorFamily}
        fullHex={fullHex}
        initialHex={cleanHex}
      />
    </div>
  );
}

// ============ METADATA GENERATION ============
export async function generateMetadata({
  params,
}: ShadesPageProps): Promise<Metadata> {
  try {
    const { hex } = await params;

    const sanitized = sanitizeHex(hex);
    if (!sanitized) {
      return {
        title: 'Color Shades Not Found',
        description: 'The requested color shades could not be found.',
        robots: { index: false, follow: false },
      };
    }

    const cleanHex = sanitized.toLowerCase();

    if (!isValidHex(cleanHex)) {
      return {
        title: 'Invalid Color',
        description: 'The requested color format is invalid.',
        robots: { index: false, follow: false },
      };
    }

    const fullHex = `#${cleanHex.toUpperCase()}`;
    const colorName = getColorName(cleanHex) || 'Unknown Color';

    const description = `Explore 100+ shades of ${colorName} (${fullHex}) including tints, tones, and dark variations.`;

    const keywords = [
      colorName,
      fullHex,
      cleanHex,
      `${colorName} shades`,
      `${colorName} color`,
      `shades of ${colorName}`,
      'color shades',
      'tints and tones',
      'color variations',
      'design palette',
      `${fullHex} shades`,
      'color swatches',
    ].join(', ');

    // const title = `${fullHex} ${colorName} - 100+ Shades & Color Variations`;

    const title = `Shades Of ${colorName} - ${fullHex}`;

    return {
      title,
      description,
      keywords,

      openGraph: {
        title,
        description,
        url: `https://www.whycolors.com/shades/${cleanHex}`,
        siteName: 'WhyColors',
        images: [
          {
            url: `https://www.whycolors.com/api/og/shades?hex=${cleanHex}`,
            width: 1200,
            height: 630,
            alt: `${colorName} Color Shades ${fullHex}`,
            type: 'image/png',
          },
        ],
        type: 'website',
        locale: 'en_US',
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`https://www.whycolors.com/api/og/shades?hex=${cleanHex}`],
        site: '@whycolors',
        creator: '@whycolors',
      },

      alternates: {
        canonical: `https://www.whycolors.com/shades/${cleanHex}`,
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      category: 'color',
      applicationName: 'WhyColors',
      referrer: 'origin-when-cross-origin',

      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Color',
          name: colorName,
          color: fullHex,
          description: `${colorName} color with 100+ shades, tints, and variations for design use.`,
          url: `https://www.whycolors.com/shades/${cleanHex}`,
          image: `https://www.whycolors.com/api/og/shades?hex=${cleanHex}`,
        }),
      },
    };
  } catch (error) {
    console.error('Error generating shades metadata:', error);
    return {
      title: 'Color Shades',
      description: 'Explore color shades, tints, and variations.',
      robots: { index: true, follow: true },
    };
  }
}

// ============ VIEWPORT GENERATION ============
export async function generateViewport({
  params,
}: ShadesPageProps): Promise<Viewport> {
  const { hex } = await params;

  const sanitized = sanitizeHex(hex);
  if (!sanitized || !isValidHex(sanitized)) {
    return {
      themeColor: '#000000',
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    };
  }

  const cleanHex = sanitized.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;

  return {
    themeColor: fullHex,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  };
}