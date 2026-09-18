// app/color/palettes/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import chroma from 'chroma-js';
import {
  generateAllPalettes,
  getColorNameFromHex,
  isValidHex,
} from '@/lib/dynamic-palettes';
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
    const colorName = getColorName(cleanHex) || 'Unknown Color';

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

      other: {
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ColorPalette',
          name: `${colorName} Color Palette`,
          description: `A collection of ${colorName} color palettes including complementary and harmonious colors.`,
          url: `https://www.whycolors.com/color/palettes/${cleanHex}`,
          image: `https://www.whycolors.com/api/og/palette?hex=${cleanHex}`,
        }),
      },
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

  const cleanHex = sanitized.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;

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
  if (!hex || !/^[a-fA-F0-9]{6}$/i.test(hex)) {
    notFound();
  }

  const cleanHex = hex.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;

  // Validate color exists
  try {
    chroma(cleanHex);
  } catch {
    notFound();
  }

  // Generate all palettes
  let palettes;
  let colorName;

  try {
    const hexWithHash = `#${cleanHex}`;
    palettes = generateAllPalettes(hexWithHash);
    colorName = getColorName(hexWithHash) || 'Color';
  } catch (error) {
    console.error('Error generating palettes:', error);
    notFound();
  }

  // ALL palette types
  const paletteTypes = [
    // Basic harmonies
    { id: 'shades', label: 'Shades', colors: palettes.shades },
    { id: 'complementary', label: 'Complementary', colors: palettes.complementary },
    { id: 'analogous', label: 'Analogous', colors: palettes.analogous },
    { id: 'triadic', label: 'Triadic', colors: palettes.triadic },
    { id: 'tetradic', label: 'Tetradic', colors: palettes.tetradic },
    { id: 'split-complementary', label: 'Split Complementary', colors: palettes['split-complementary'] },
    { id: 'square', label: 'Square', colors: palettes.square },

    // Mood-based
    { id: 'pastel', label: 'Pastel', colors: palettes.pastel },
    { id: 'vibrant', label: 'Vibrant', colors: palettes.vibrant },
    { id: 'muted', label: 'Muted', colors: palettes.muted },
    { id: 'dark', label: 'Dark Shades', colors: palettes.dark },
    { id: 'light', label: 'Light Tints', colors: palettes.light },
    { id: 'warm', label: 'Warm Palette', colors: palettes.warm },
    { id: 'cool', label: 'Cool Palette', colors: palettes.cool },

    // Design palettes
    { id: 'quietLuxury', label: 'Quiet Luxury', colors: palettes.quietLuxury },
    { id: 'gothicNoir', label: 'Gothic Noir', colors: palettes.gothicNoir },
    { id: 'cozyCampfire', label: 'Cozy Campfire', colors: palettes.cozyCampfire },
    { id: 'lavenderLullaby', label: 'Lavender Lullaby', colors: palettes.lavenderLullaby },

    // Makeup palettes
    { id: 'softGlam', label: 'Soft Glam', colors: palettes.softGlam },
    { id: 'berryMartini', label: 'Berry Martini', colors: palettes.berryMartini },
    { id: 'neutrals', label: 'Neutrals', colors: palettes.neutrals },

    // Advanced harmonies
    { id: 'monochromatic', label: 'Monochromatic', colors: palettes.monochromatic },
    { id: 'compound', label: 'Compound', colors: palettes.compound },
    { id: 'neutral', label: 'Neutral', colors: palettes.neutral },
    { id: 'gradient', label: 'Gradient', colors: palettes.gradient },

    // Thematic
    { id: 'neon', label: 'Neon', colors: palettes.neon },
    { id: 'earth', label: 'Earth', colors: palettes.earth },
    { id: 'ocean', label: 'Ocean', colors: palettes.ocean },
    { id: 'sunset', label: 'Sunset', colors: palettes.sunset },
    { id: 'forest', label: 'Forest', colors: palettes.forest },
    { id: 'vintage', label: 'Vintage', colors: palettes.vintage },
    { id: 'modern', label: 'Modern', colors: palettes.modern },

    // Special combinations
    { id: 'pastel-neon', label: 'Pastel Neon', colors: palettes.pastelNeon },
    { id: 'monochrome-dark', label: 'Dark Monochrome', colors: palettes.monochromeDark },
    { id: 'monochrome-light', label: 'Light Monochrome', colors: palettes.monochromeLight },
    { id: 'accent', label: 'Accent Palette', colors: palettes.accent },
    { id: 'gradient-warm', label: 'Warm Gradient', colors: palettes.gradientWarm },
    { id: 'gradient-cool', label: 'Cool Gradient', colors: palettes.gradientCool },
    { id: 'split', label: 'Split', colors: palettes.split },
    { id: 'double-split', label: 'Double Split', colors: palettes.doubleSplit },
    { id: 'adjacent', label: 'Adjacent', colors: palettes.adjacent },
    { id: 'alternating', label: 'Alternating', colors: palettes.alternating },
    { id: 'rainbow', label: 'Rainbow', colors: palettes.rainbow },
    { id: 'tintShadeScale', label: 'Tint & Shade Scale (10 colors)', colors: palettes.tintShadeScale },
    { id: 'uiPalette', label: 'UI Palette', colors: palettes.uiPalette },
    { id: 'clash', label: 'Clash Palette', colors: palettes.clash },
    { id: 'saturationScale', label: 'Saturation Scale', colors: palettes.saturationScale },

    // Cafe & flavors
    { id: 'vanillaLatte', label: 'Vanilla Latte', colors: palettes.vanillaLatte },
    { id: 'saltedCaramel', label: 'Salted Caramel', colors: palettes.saltedCaramel },
    { id: 'matchaLatte', label: 'Matcha Latte', colors: palettes.matchaLatte },
    { id: 'berryBlast', label: 'Berry Blast', colors: palettes.berryBlast },
    { id: 'honeyAlmond', label: 'Honey Almond', colors: palettes.honeyAlmond },
    { id: 'mocha', label: 'Mocha', colors: palettes.mocha },

    // Cosmic & dreamy
    { id: 'stardust', label: 'Stardust', colors: palettes.stardust },
    { id: 'cyberpunkNight', label: 'Cyberpunk Night', colors: palettes.cyberpunkNight },
    { id: 'moonlitSilver', label: 'Moonlit Silver', colors: palettes.moonlitSilver },
    { id: 'auroraBorealis', label: 'Aurora Borealis', colors: palettes.auroraBorealis },
    { id: 'galaxy', label: 'Galaxy', colors: palettes.galaxy },
    { id: 'dreamscape', label: 'Dreamscape', colors: palettes.dreamscape },

    // Vintage & editorial
    { id: 'velvetRomance', label: 'Velvet Romance', colors: palettes.velvetRomance },
    { id: 'antiqueParchment', label: 'Antique Parchment', colors: palettes.antiqueParchment },
    { id: 'retroFunk', label: 'Retro Funk', colors: palettes.retroFunk },
    { id: 'desertOasis', label: 'Desert Oasis', colors: palettes.desertOasis },
    { id: 'vintageRose', label: 'Vintage Rose', colors: palettes.vintageRose },
    { id: 'editorial', label: 'Editorial', colors: palettes.editorial },

    // Tech & functional
    { id: 'glassmorphism', label: 'Glassmorphism Bases', colors: palettes.glassmorphism },
    { id: 'retroTerminal', label: 'Retro Terminal', colors: palettes.retroTerminal },
    { id: 'accessibleHighContrast', label: 'High Contrast (A11y)', colors: palettes.accessibleHighContrast },
    { id: 'brandIdentity', label: 'Brand Identity', colors: palettes.brandIdentity },
    { id: 'neubrutalism', label: 'Neubrutalism', colors: palettes.neubrutalism },
    { id: 'darkModeUI', label: 'Dark Mode UI', colors: palettes.darkModeUI },

    // New palettes
    { id: 'cyberLime', label: 'Cyber Lime / Brat', colors: palettes.cyberLime },
    { id: 'nordicScandi', label: 'Nordic Scandi', colors: palettes.nordicScandi },
    { id: 'industrialConcrete', label: 'Industrial Concrete', colors: palettes.industrialConcrete },
    { id: 'mediterranean', label: 'Mediterranean Villa', colors: palettes.mediterranean },
    { id: 'springBloom', label: 'Spring Bloom', colors: palettes.springBloom },
    { id: 'autumnWhimsy', label: 'Autumn Whimsy', colors: palettes.autumnWhimsy },
    { id: 'winterSolstice', label: 'Winter Solstice', colors: palettes.winterSolstice },
    { id: 'synthwave80s', label: 'Synthwave 80s', colors: palettes.synthwave80s },
    { id: 'kawaiiPastel', label: 'Kawaii Pastel', colors: palettes.kawaiiPastel },
    { id: 'renaissance', label: 'Renaissance Oil', colors: palettes.renaissance },
    { id: 'popArt', label: '60s Pop Art', colors: palettes.popArt },
  ];

  // Filter out empty/undefined palettes
  const validPaletteTypes = paletteTypes.filter(
    (p) => p.colors && Array.isArray(p.colors) && p.colors.length > 0
  );

  return (
    // ✅ FIX 1: dark:bg-gray-900 → dark:bg-[#090911] (match PaletteClient)
    <div className="min-h-screen bg-gray-50 dark:bg-[#090911] transition-colors duration-300">
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

            {/* <ChevronRight
              className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
              aria-hidden="true"
            /> */}

            {/* <Link
              href={`/color/${cleanHex}`}
              className="transition-colors p-1 rounded-md hover:text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/5"
            >
              {colorName}
            </Link> */}

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
          {/*
            ✅ FIX 2: Remove hardcoded isDark={false}
            Make SocialShare default to using useTheme() internally.
            (See SocialShare component fix below)
          */}
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

      {/* ✅ Client Component */}
      <PaletteClient
        hex={cleanHex}
        fullHex={fullHex}
        colorName={colorName}
        paletteTypes={validPaletteTypes}
      />
    </div>
  );
}