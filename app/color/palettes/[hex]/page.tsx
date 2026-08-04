// app/color/palettes/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import chroma from 'chroma-js';
import { 
  generateAllPalettes, 
  getColorNameFromHex,
} from '@/lib/dynamic-palettes';
import PaletteClient from './PaletteClient';

interface ColorPalettePageProps {
  params: Promise<{
    hex: string;
  }>;
}

// ✅ Generate static paths
export function generateStaticParams() {
  const commonColors = [
    'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
    '000000', 'ffffff', 'ffa500', 'ffc0cb', '8b5cf6', 'ef4444',
    '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316', '06b6d4',
    '6366f1', '14b8a6', 'f43f5e', 'f59e0b', '84cc16', '10b981',
    '0ea5e9', 'd946ef', 'fb7185', '1e293b', '4b5563', '34d399',
    'fdba74', 'c4b5fd', '86efac', 'c2410c', '1f2937', 'fef3c7'
  ];
  
  return commonColors.map(hex => ({
    hex: hex
  }));
}

// ✅ DYNAMIC METADATA - Runs on server
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
  const colorName = getColorNameFromHex(cleanHex);
  
  // Generate SEO-friendly description
  const description = `Explore ${colorName} color palettes including shades, complementary, analogous, triadic, tetradic, and more. Perfect for designers and developers.`;
  
  // Generate keywords
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
      siteName: 'Color Tools',
      images: [
        {
          url: `https://www.whycolors.com/api/og/color?hex=${cleanHex}`,
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
      images: [`https://www.whycolors.com/api/og/color?hex=${cleanHex}`],
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
  
  if (!hex || !/^[a-fA-F0-9]{6}$/i.test(hex)) {
    notFound();
  }
  
  const cleanHex = hex.toLowerCase();
  const fullHex = `#${cleanHex.toUpperCase()}`;
  const colorName = getColorNameFromHex(cleanHex);
  const palettes = generateAllPalettes(cleanHex);
  
  try {
    chroma(cleanHex);
  } catch {
    notFound();
  }
  
  const paletteTypes = [
    { id: 'shades', label: 'Shades', icon: '🎨', colors: palettes.shades },
    { id: 'complementary', label: 'Complementary', icon: '⚡', colors: palettes.complementary },
    { id: 'analogous', label: 'Analogous', icon: '🌈', colors: palettes.analogous },
    { id: 'triadic', label: 'Triadic', icon: '🔺', colors: palettes.triadic },
    { id: 'tetradic', label: 'Tetradic', icon: '🔲', colors: palettes.tetradic },
    { id: 'split-complementary', label: 'Split Complementary', icon: '🔀', colors: palettes['split-complementary'] },
    { id: 'square', label: 'Square', icon: '⬜', colors: palettes.square },
    { id: 'pastel', label: 'Pastel', icon: '🌸', colors: palettes.pastel },
    { id: 'vibrant', label: 'Vibrant', icon: '💥', colors: palettes.vibrant },
    { id: 'muted', label: 'Muted', icon: '🌫️', colors: palettes.muted },
    { id: 'dark', label: 'Dark Shades', icon: '🌑', colors: palettes.dark },
    { id: 'light', label: 'Light Tints', icon: '☀️', colors: palettes.light },
  ];
  
  return (
    <PaletteClient 
      hex={cleanHex}
      fullHex={fullHex}
      colorName={colorName}
      paletteTypes={paletteTypes}
    />
  );
}