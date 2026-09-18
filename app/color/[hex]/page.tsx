// app/color/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import {
  getColorName,
  isValidHex,
  hexToRgbArray,
  sanitizeHex,
  getColorFamily,
  hexToRgb,
  hexToHsl,
  hexToHsv,
  hexToCmyk,
  getContrastColor,
} from '@/lib/color-utils';
import ColorDetail from '@/components/color/ColorDetail';
import SocialShare from '@/components/color/SocialShare';

interface ColorPageProps {
  params: Promise<{
    hex: string;
  }>;
}

// ============ ROUTE CONFIG ============
export const dynamicParams = true;
export const revalidate = 86400;

// ============ PAGE COMPONENT ============
export default async function ColorPage({ params }: ColorPageProps) {
  const { hex } = await params;

  // Step 1: Sanitize and validate hex
  const sanitized = sanitizeHex(hex);
  if (!sanitized) notFound();

  const cleanHex = sanitized.toLowerCase();

  // Step 2: Validate hex format
  if (!isValidHex(cleanHex)) notFound();

  // Step 3: Validate RGB conversion
  try {
    const rgb = hexToRgbArray(cleanHex);
    if (!rgb) notFound();
  } catch {
    notFound();
  }

  // Step 4: Server-computed color information
  const colorName = getColorName(cleanHex) || 'Color';
  const colorFamily = getColorFamily(cleanHex) || 'Color';
  const fullHex = `#${cleanHex.toUpperCase()}`;
  const rgb = hexToRgb(cleanHex);
  const hsl = hexToHsl(cleanHex);
  const hsv = hexToHsv(cleanHex);
  const cmyk = hexToCmyk(cleanHex);
  const contrast = getContrastColor(cleanHex);

  // Step 5: Render
  return (
    // ✅ FIX 1: Added background — matches PaletteClient dark bg
    <div className="min-h-screen bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-8">
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
            </Link>

            <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            />

            <Link
              href="/color"
              className="transition-colors p-1 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5"
            >
              Color
            </Link>

            <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            />

            {/* Hex pill with ids for client-side updates */}
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-white"
              aria-current="page"
            >
              <span
                id="color-breadcrumb-dot"
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: fullHex }}
                aria-hidden="true"
              />
              <span id="color-breadcrumb-hex" className="font-mono">
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
  id="color-h1"
  className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
>
  <span id="color-h1-name">{colorName}</span>
  <span className="ml-2">Color</span>
  <span
    id="color-h1-hex"
    className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400"
  >
    {` ${fullHex}`}
  </span>
</h1>
      </div>

      {/* Client component — interactive part */}
      <ColorDetail
        hex={cleanHex}
        colorName={colorName}
        colorFamily={colorFamily}
        rgb={rgb}
        hsl={hsl}
        hsv={hsv}
        cmyk={cmyk}
        contrast={contrast}
      />
    </div>
  );
}

// ============ METADATA GENERATION ============
export async function generateMetadata({
  params,
}: ColorPageProps): Promise<Metadata> {
  try {
    const { hex } = await params;

    const sanitized = sanitizeHex(hex);
    if (!sanitized) {
      return {
        title: 'Invalid Color',
        description: 'The requested color could not be found.',
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

    const colorName = getColorName(cleanHex) || 'Unknown Color';
    const colorFamily = getColorFamily(cleanHex) || 'Unknown';
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const rgb = hexToRgb(cleanHex);
    const hsl = hexToHsl(cleanHex);

    const descriptionParts = [
      `Explore ${colorName} (${fullHex})`,
      rgb ? `RGB: ${rgb}` : '',
      hsl ? `HSL: ${hsl}` : '',
      `Part of the ${colorFamily} color family`,
    ].filter(Boolean);

    const description = descriptionParts.join(' • ');

    const keywords = [
      colorName,
      fullHex,
      cleanHex,
      `${colorName} color`,
      `color ${fullHex}`,
      colorFamily,
      'color code',
      'hex color',
      'color converter',
      'color palette',
      'color harmonies',
      'shades',
      'tints',
      'similar colors',
    ].join(', ');

    const title = `${fullHex} ${colorName} - Color Details, HEX, RGB, Shades & Gradients`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description: `Explore ${colorName} (${fullHex}) with conversions, shades, tints, harmonies, and similar colors.`,
        url: `https://www.whycolors.com/color/${cleanHex}`,
        siteName: 'WhyColors',
        images: [
          {
            url: `https://www.whycolors.com/api/og/color?hex=${cleanHex}`,
            width: 1200,
            height: 630,
            alt: `${colorName} Color ${fullHex}`,
            type: 'image/png',
          },
        ],
        type: 'website',
        locale: 'en_US',
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description: `Explore ${colorName} (${fullHex}) with conversions, shades, tints, harmonies, and similar colors.`,
        images: [`https://www.whycolors.com/api/og/color?hex=${cleanHex}`],
        site: '@whycolors',
        creator: '@whycolors',
      },

      alternates: {
        canonical: `https://www.whycolors.com/color/${cleanHex}`,
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
          description: `${colorName} is a ${colorFamily} color with hex code ${fullHex}.`,
          url: `https://www.whycolors.com/color/${cleanHex}`,
          image: `https://www.whycolors.com/api/og/color?hex=${cleanHex}`,
        }),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Color Details',
      description: 'Explore color information, conversions, and harmonies.',
      robots: { index: true, follow: true },
    };
  }
}

// ============ VIEWPORT GENERATION ============
export async function generateViewport({
  params,
}: ColorPageProps): Promise<Viewport> {
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