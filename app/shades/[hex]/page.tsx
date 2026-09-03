// app/shades/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { 
  getColorName, 
  isValidHex, 
  sanitizeHex,
  getColorFamily,
  hexToRgb,
} from '@/lib/color-utils';
import ShadesClient from '@/components/shades/ShadesClient';

interface ShadesPageProps {
  params: Promise<{
    hex: string;
  }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export default async function ShadesPage({ params }: ShadesPageProps) {
  const { hex } = await params;
  
  const sanitized = sanitizeHex(hex);
  if (!sanitized) {
    notFound();
  }
  
  const cleanHex = sanitized.toLowerCase();
  
  if (!isValidHex(cleanHex)) {
    notFound();
  }
  
  try {
    const rgb = hexToRgb(cleanHex);
    if (!rgb) {
      notFound();
    }
  } catch {
    notFound();
  }
  
  const colorName = getColorName(cleanHex);
  const colorFamily = getColorFamily(cleanHex);
  
  return (
    <div className="min-h-screen">
      <ShadesClient 
        colorName={colorName}
        colorFamily={colorFamily}
      />
    </div>
  );
}

export async function generateMetadata({ params }: ShadesPageProps): Promise<Metadata> {
  const { hex } = await params;
  
  const sanitized = sanitizeHex(hex);
  if (!sanitized || !isValidHex(sanitized)) {
    return {
      title: 'Invalid Color Shades',
      robots: { index: false, follow: false },
    };
  }
  
  const cleanHex = sanitized.toLowerCase();
  const colorName = getColorName(cleanHex);
  const fullHex = `#${cleanHex.toUpperCase()}`;
  
  return {
    title: `${fullHex} ${colorName} - 100+ Shades & Color Variations`,
    description: `Explore 100+ shades of ${fullHex} (${colorName}) including tints, tones, and dark shades. Perfect for design palettes.`,
    keywords: `${colorName}, ${fullHex}, shades, tints, color palette, ${colorName} shades, color variations, design colors`,
    openGraph: {
      title: `${fullHex} ${colorName} - 100+ Shades & Color Variations`,
      description: `Explore 100+ shades of ${fullHex} (${colorName}) including tints, tones, and dark shades.`,
      url: `https://www.whycolors.com/shades/${cleanHex}`,
      siteName: 'WhyColors',
      images: [
        {
          url: `https://www.whycolors.com/api/og/shades?hex=${cleanHex}`,
          width: 1200,
          height: 630,
          alt: `${colorName} Color Shades ${fullHex}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullHex} ${colorName} - 100+ Shades`,
      description: `Explore 100+ shades of ${fullHex} (${colorName})`,
      images: [`https://www.whycolors.com/api/og/shades?hex=${cleanHex}`],
    },
    alternates: {
      canonical: `https://www.whycolors.com/shades/${cleanHex}`,
    },
  };
}