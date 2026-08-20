import type { Metadata } from 'next';
import Link from 'next/link';
import { getColorPageColors } from '@/lib/color-cache.server';
import { getColorName } from '@/lib/color-utils';
import ColorClient from './ColorClient';

// Static metadata for the main page
export const metadata: Metadata = {
  title: 'Color Code Finder - Hex, RGB, HSL, OKLCH Converter & Color Picker',
  description: 'Easily find and convert color codes for your web design projects. Use our color picker, explore the color wheel, browse color charts, and reference HTML color names to get accurate Hex, RGB, HSL, and OKLCH values.',
  keywords: [
    'color codes',
    'hex color codes',
    'rgb color codes',
    'hsl color codes',
    'oklch color codes',
    'color picker',
    'color wheel',
    'color chart',
    'html color names',
    'color converter',
    'web colors',
    'color palette',
    'color tool'
  ],
  openGraph: {
    title: 'Color Code Finder - Hex, RGB, HSL, OKLCH Converter & Color Picker',
    description: 'Find the perfect color codes for your next project. Our color tools include a powerful color picker, interactive color wheel, detailed color chart, and complete HTML color names reference.',
    url: 'https://whycolors.com/color',
    siteName: 'WhyColors',
    images: [
      {
        url: 'https://whycolors.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Color Code Finder - Hex, RGB, HSL, OKLCH Converter'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Code Finder - Hex, RGB, HSL, OKLCH Converter',
    description: 'Easily find and convert color codes for your web design projects. Use our color picker, explore the color wheel, browse color charts, and reference HTML color names to get accurate Hex, RGB, HSL, and OKLCH values.',
    images: ['https://whycolors.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://whycolors.com/color',
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

export default function ColorPage() {
  const allColors = getColorPageColors();
  const displayColors = allColors.slice(0, 24);
  
  return <ColorClient initialColors={displayColors} totalColors={allColors.length} />;
}