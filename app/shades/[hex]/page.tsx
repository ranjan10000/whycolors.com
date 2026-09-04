// app/shades/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata,Viewport } from 'next';
import { 
  getColorName, 
  isValidHex, 
  sanitizeHex,
  getColorFamily,
  hexToRgb,
} from '@/lib/color-utils';
import ShadesClient from '@/components/shades/ShadesClient';
import ShadesFAQ from '@/components/shades/ShadesFAQ';

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
      <ShadesFAQ colorName={colorName} hex={cleanHex} colorFamily={colorFamily} />
    </div>
  );
}

// ============ METADATA GENERATION - SHADES ============

// ============ METADATA GENERATION ============
export async function generateMetadata({ params }: ShadesPageProps): Promise<Metadata> {
  try {
    const { hex } = await params;
    
    // Validate hex
    const sanitized = sanitizeHex(hex);
    if (!sanitized) {
      return {
        title: 'Color Shades Not Found',
        description: 'The requested color shades could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }
    
    const cleanHex = sanitized.toLowerCase();
    
    // Check if it's a valid color
    if (!isValidHex(cleanHex)) {
      return {
        title: 'Invalid Color',
        description: 'The requested color format is invalid.',
        robots: { 
          index: false, 
          follow: false 
        },
      };
    }
    
    // Get color information with fallback
    const fullHex = `#${cleanHex.toUpperCase()}`;
    const colorName = getColorName(cleanHex) || 'Unknown Color';
    
    // Build description (keep under 160 characters)
    const description = `Explore 100+ shades of ${colorName} (${fullHex}) including tints, tones, and dark variations.`;
    
    // Generate keywords
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
      'color swatches'
    ].join(', ');
    
    // Generate title
    const title = `${fullHex} ${colorName} - 100+ Shades & Color Variations`;
    
    return {
      title,
      description,
      keywords,
      
      // ❌ REMOVE these lines:
      // viewport: { ... },
      // themeColor: fullHex,
      
      openGraph: {
        title,
        description: `Explore 100+ shades of ${colorName} (${fullHex}) including tints, tones, and dark variations.`,
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
        description: `Explore 100+ shades of ${colorName} (${fullHex}) including tints, tones, and dark variations.`,
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
      
      // Additional metadata
      category: 'color',
      applicationName: 'WhyColors',
      referrer: 'origin-when-cross-origin',
      
      // Structured data for rich snippets
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
    // Handle any unexpected errors
    console.error('Error generating shades metadata:', error);
    return {
      title: 'Color Shades',
      description: 'Explore color shades, tints, and variations.',
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

// ============ VIEWPORT GENERATION ============
// ✅ ADD THIS NEW FUNCTION
export async function generateViewport({ 
  params 
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
    themeColor: fullHex,      // ✅ Theme color here
    width: 'device-width',    // ✅ Viewport here
    initialScale: 1,
    maximumScale: 5,
  };
}