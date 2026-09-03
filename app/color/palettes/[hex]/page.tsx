// app/color/palettes/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import chroma from 'chroma-js';
import { 
  generateAllPalettes, 
  getColorNameFromHex,
  isValidHex,
} from '@/lib/dynamic-palettes';
import { getColorName } from '@/lib/color-utils';
import PaletteClient from './PaletteClient';

interface ColorPalettePageProps {
  params: Promise<{
    hex: string;
  }>;
}

export async function generateMetadata({ 
  params 
}: ColorPalettePageProps): Promise<Metadata> {
  const { hex } = await params;
  
  if (!hex || !/^[a-fA-F0-9]{6}$/i.test(hex)) {
    return {
      title: 'Color Not Found',
      description: 'The requested color palette could not be found.'
    };
  }
  
  const cleanHex = hex.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;
  const colorName = getColorName(`#${cleanHex}`);
  
  const description = `Explore ${colorName} color palettes including shades, complementary, analogous, triadic, tetradic, and more. Perfect for designers and developers.`;
  const keywords = [
    colorName,
    `${colorName} color`,
    `${colorName} palette`,
    `${fullHex} color`,
    'color palette',
    'color harmonies',
    'color wheel',
    'design colors'
  ].join(', ');
  
  return {
    title: `${colorName} Color Palettes (${fullHex})`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${colorName} Color Palettes (${fullHex})`,
      description: `Explore ${colorName} color palettes including shades, complementary, and harmonious color combinations.`,
      url: `https://www.whycolors.com/color/palettes/${cleanHex}`,
      siteName: 'WhyColors',
      images: [
        {
          url: `https://www.whycolors.com/api/og/palette?hex=${cleanHex}`,
          width: 1200,
          height: 630,
          alt: `${colorName} Color Palettes`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${colorName} Color Palettes (${fullHex})`,
      description: `Explore ${colorName} color palettes including shades, complementary, and harmonious color combinations.`,
      images: [`https://www.whycolors.com/api/og/palette?hex=${cleanHex}`],
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
  };
}

export default async function ColorPalettePage({ params }: ColorPalettePageProps) {
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
    colorName = getColorName(hexWithHash);
  } catch (error) {
    console.error('Error generating palettes:', error);
    notFound();
  }
  
  // ALL palette types with icons
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
  ];
  
  // Filter out any palette types that have undefined or empty colors
  const validPaletteTypes = paletteTypes.filter(p => 
    p.colors && Array.isArray(p.colors) && p.colors.length > 0
  );
  
  // ✅ RETURN WITH H1
  return (
    <div className="min-h-screen">
      
      {/* ✅ HERO SECTION WITH H1 - Server Rendered for SEO */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-[#090911] dark:to-[#0d0d1a] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Color Swatch */}
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl shadow-lg border-2 border-white dark:border-gray-700 flex-shrink-0"
              style={{ backgroundColor: fullHex }}
            />
            <div>
              {/* ✅ H1 - Main heading for SEO */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {colorName} Color Palettes
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300">
                  {fullHex}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {validPaletteTypes.length} Palettes
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Explore harmonious color palettes for {colorName}
              </p>
            </div>
          </div>
        </div>
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