// app/color/palettes/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import {
  getCachedPalettes,
  isValidHex,
  type AllPalettes,
} from '@/lib/dynamic-palettes';
import { buildPaletteTypes } from '../palette-types';
import { getColorName, sanitizeHex } from '@/lib/color-utils';
import PaletteClient from './PaletteClient';
import SocialShare from '@/components/color/SocialShare';

interface ColorPalettePageProps {
  params: Promise<{ hex: string }>;
}

// ============ METADATA GENERATION ============
export async function generateMetadata({
  params,
}: ColorPalettePageProps): Promise<Metadata> {
  try {
    const { hex } = await params;

    const sanitized = sanitizeHex(hex);
    if (!sanitized) {
      return {
        title: 'Color Palette Not Found',
        description: 'The requested color palette could not be found.',
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
    // Always pass the "#" form, same as the page body, so title and H1 use the same name
    const colorName = getColorName(`#${cleanHex}`) || 'Unknown Color';

    const description = `Explore ${colorName} color palettes including shades, complementary, analogous, triadic, and harmonious combinations.`;
    const keywords = [
      colorName,
      `${colorName} color`,
      `${colorName} palette`,
      `${fullHex} color`,
      'color palette',
      'color harmonies',
      'color wheel',
      'design colors',
      'complementary colors',
      'analogous colors',
      'triadic colors',
      'color combinations',
    ].join(', ');

    const title = `${colorName} Color Palettes (${fullHex})`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description: `Explore ${colorName} color palettes including shades, complementary, and harmonious color combinations.`,
        url: `https://www.whycolors.com/color/palettes/${cleanHex}`,
        siteName: 'WhyColors',
        images: [
          {
            url: `https://www.whycolors.com/api/og/palette?hex=${cleanHex}`,
            width: 1200,
            height: 630,
            alt: `${colorName} Color Palettes`,
            type: 'image/png',
          },
        ],
        type: 'website',
        locale: 'en_US',
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description: `Explore ${colorName} color palettes including shades, complementary, and harmonious color combinations.`,
        images: [`https://www.whycolors.com/api/og/palette?hex=${cleanHex}`],
        site: '@whycolors',
        creator: '@whycolors',
      },

      alternates: {
        canonical: `https://www.whycolors.com/color/palettes/${cleanHex}`,
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
    };
  } catch (error) {
    console.error('Error generating palette metadata:', error);
    return {
      title: 'Color Palettes',
      description: 'Explore color palettes, harmonies, and combinations.',
      robots: { index: true, follow: true },
    };
  }
}

// ============ VIEWPORT GENERATION ============
export async function generateViewport({
  params,
}: ColorPalettePageProps): Promise<Viewport> {
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

  const fullHex = `#${sanitized.toUpperCase()}`;

  return {
    themeColor: fullHex,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  };
}

// ============ PAGE COMPONENT ============
export default async function ColorPalettePage({
  params,
}: ColorPalettePageProps) {
  const { hex } = await params;

  // Validate hex format
  if (!hex || !/^[a-fA-F0-9]{6}$/.test(hex)) {
    notFound();
  }

  const cleanHex = hex.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;

  // Generate palettes (cached, bounded LRU)
  let palettes: AllPalettes;
  let colorName: string;

  try {
    const hexWithHash = `#${cleanHex}`;
    palettes = getCachedPalettes(hexWithHash);
    colorName = getColorName(hexWithHash) || 'Color';
  } catch (error) {
    console.error('Error generating palettes:', error);
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${colorName} Color Palettes`,
    description: `A collection of ${colorName} color palettes including complementary and harmonious colors.`,
    url: `https://www.whycolors.com/color/palettes/${cleanHex}`,
    image: `https://www.whycolors.com/api/og/palette?hex=${cleanHex}`,
  };

  // Derived from the registry — keys/labels can't drift out of sync with the lib
  const paletteTypes = buildPaletteTypes(palettes);

  // Filter out empty/undefined palettes
  const validPaletteTypes = paletteTypes.filter(
    (p) => Array.isArray(p.colors) && p.colors.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        {/* ============================================================
            BREADCRUMB + SOCIAL SHARE ROW
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
                id="palette-breadcrumb-dot"
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: fullHex }}
                aria-hidden="true"
              />
              <span id="palette-breadcrumb-hex" className="font-mono">
                {fullHex}
              </span>
            </div>
          </div>

          {/* Right: SocialShare — client-rendered */}
          <div className="flex-shrink-0">
            <SocialShare hex={cleanHex} colorName={colorName} />
          </div>
        </nav>

        {/* ============================================================
            SERVER-RENDERED H1
        ============================================================ */}
        <h1
          id="palette-h1"
          className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          <span id="palette-h1-name">{colorName}</span>
          <span className="ml-2">Color Palettes</span>
          <span
            id="palette-h1-hex"
            className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400"
          >
            {` ${fullHex}`}
          </span>
        </h1>
      </div>

      {/* Client Component */}
      <PaletteClient
        hex={cleanHex}
        fullHex={fullHex}
        colorName={colorName}
        paletteTypes={validPaletteTypes}
      />
    </div>
  );
}