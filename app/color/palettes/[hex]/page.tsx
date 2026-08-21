// app/color/palettes/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import chroma from 'chroma-js';
import { 
  generateAllPalettes, 
  getColorNameFromHex,
  isValidHex,
} from '@/lib/dynamic-palettes';
  import {getColorName
} from '@/lib/color-utils';
import PaletteClient from './PaletteClient';

interface ColorPalettePageProps {
  params: Promise<{
    hex: string;
  }>;
}

// Generate static paths
// export function generateStaticParams() {
//   const commonColors = [
//     'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
//     '000000', 'ffffff', 'ffa500', 'ffc0cb', '8b5cf6', 'ef4444',
//     '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316', '06b6d4',
//     '6366f1', '14b8a6', 'f43f5e', 'f59e0b', '84cc16', '10b981',
//     '0ea5e9', 'd946ef', 'fb7185', '1e293b', '4b5563', '34d399',
//     'fdba74', 'c4b5fd', '86efac', 'c2410c', '1f2937', 'fef3c7',
//     '2b7877', // Dark Teal
//   ];
  
//   return commonColors.map(hex => ({
//     hex: hex
//   }));
// }

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
  const colorName = getColorName(`#${cleanHex}`); // ✅ Add # prefix
  
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
    title: `${colorName} Color Palettes (${fullHex}) - Color Palettes`,
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
    // ✅ IMPORTANT: Pass with # prefix
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
    { id: 'complementary', label: 'Complementary',  colors: palettes.complementary },
    { id: 'analogous', label: 'Analogous', colors: palettes.analogous },
    { id: 'triadic', label: 'Triadic', colors: palettes.triadic },
    { id: 'tetradic', label: 'Tetradic',  colors: palettes.tetradic },
    { id: 'split-complementary', label: 'Split Complementary', colors: palettes['split-complementary'] },
    { id: 'square', label: 'Square', colors: palettes.square },
    
    // Mood-based
    { id: 'pastel', label: 'Pastel', colors: palettes.pastel },
    { id: 'vibrant', label: 'Vibrant', colors: palettes.vibrant },
    { id: 'muted', label: 'Muted', colors: palettes.muted },
    { id: 'dark', label: 'Dark Shades',  colors: palettes.dark },
    { id: 'light', label: 'Light Tints', colors: palettes.light },
    { id: 'warm', label: 'Warm Palette', colors: palettes.warm },
    { id: 'cool', label: 'Cool Palette', colors: palettes.cool },
    
    // Advanced harmonies
    { id: 'monochromatic', label: 'Monochromatic', colors: palettes.monochromatic },
    { id: 'compound', label: 'Compound',colors: palettes.compound },
    { id: 'neutral', label: 'Neutral', colors: palettes.neutral },
    { id: 'gradient', label: 'Gradient', colors: palettes.gradient },
    
    // Thematic
    { id: 'neon', label: 'Neon', colors: palettes.neon },
    { id: 'earth', label: 'Earth',  colors: palettes.earth },
    { id: 'ocean', label: 'Ocean', colors: palettes.ocean },
    { id: 'sunset', label: 'Sunset', colors: palettes.sunset },
    { id: 'forest', label: 'Forest', colors: palettes.forest },
    { id: 'vintage', label: 'Vintage', colors: palettes.vintage },
    { id: 'modern', label: 'Modern', colors: palettes.modern },
    
    // Special combinations
    { id: 'pastel-neon', label: 'Pastel Neon',  colors: palettes.pastelNeon },
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
  
  return (
    <PaletteClient 
      hex={cleanHex}
      fullHex={fullHex}
      colorName={colorName}
      paletteTypes={validPaletteTypes}
    />
  );
}