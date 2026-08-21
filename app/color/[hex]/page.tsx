// app/color/[hex]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getColors } from '@/lib/color-cache';
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
  getContrastColor
} from '@/lib/color-utils';
import ColorDetail from '@/components/color/ColorDetail';

interface ColorPageProps {
  params: Promise<{
    hex: string;
  }>;
}

// ============ STATIC PATHS GENERATION ============

/**
 * Generate static paths for ALL 7,800 colors at build time
 * Uses cached data from color-cache (generated only once)
 */
// export function generateStaticParams() {
//   try {
//     const colors = getColors();
//     console.log(`📦 Generating ${colors.length} static color paths`);
    
//     return colors.map(hex => ({
//       hex: hex.toLowerCase()
//     }));
//   } catch (error) {
//     console.error('Error generating color params:', error);
//     // Fallback to common colors if cache fails
//     const fallbackColors = [
//       'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
//       '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6'
//     ];
//     return fallbackColors.map(hex => ({
//       hex: hex.toLowerCase()
//     }));
//   }
// }

// ============ ROUTE CONFIG ============

/**
 * Allow dynamic generation for ANY valid hex color
 * Pages are cached after first visit
 */
export const dynamicParams = true;
export const revalidate = 86400; // Revalidate every 24 hours

// ============ PAGE COMPONENT ============

export default async function ColorPage({ params }: ColorPageProps) {
  const { hex } = await params;
  
  // Step 1: Sanitize and validate hex
  const sanitized = sanitizeHex(hex);
  if (!sanitized) {
    notFound();
  }
  
  const cleanHex = sanitized.toLowerCase();
  
  // Step 2: Validate hex format
  if (!isValidHex(cleanHex)) {
    notFound();
  }
  
  // Step 3: Validate RGB conversion
  try {
    const rgb = hexToRgbArray(cleanHex);
    if (!rgb) {
      notFound();
    }
  } catch {
    notFound();
  }
  
  // Step 4: Get color information
  const colorName = getColorName(cleanHex);
  const colorFamily = getColorFamily(cleanHex);
  const rgb = hexToRgb(cleanHex);
  const hsl = hexToHsl(cleanHex);
  const hsv = hexToHsv(cleanHex);
  const cmyk = hexToCmyk(cleanHex);
  const contrast = getContrastColor(cleanHex);
  
  // Step 5: Render the page
  return (
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
  );
}

// ============ METADATA GENERATION ============

export async function generateMetadata({ params }: ColorPageProps): Promise<Metadata> {
  const { hex } = await params;
  
  // Validate hex for metadata
  const sanitized = sanitizeHex(hex);
  if (!sanitized) {
    return {
      title: 'Invalid Color',
      description: 'The requested color could not be found.',
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
      robots: { index: false, follow: false },
    };
  }
  
  // Get color information for metadata
  const colorName = getColorName(cleanHex);
  const colorFamily = getColorFamily(cleanHex);
  const fullHex = `#${cleanHex.toUpperCase()}`;
  const rgb = hexToRgb(cleanHex);
  const hsl = hexToHsl(cleanHex);
  
  // Build rich description
  const descriptionParts = [
    `Explore ${fullHex} (${colorName})`,
    rgb ? `RGB: ${rgb}` : '',
    hsl ? `HSL: ${hsl}` : '',
    `Part of the ${colorFamily} color family`,
    'View conversions, shades, tints, harmonies, and similar colors.'
  ].filter(Boolean);
  
  const description = descriptionParts.join(' • ');
  
  // Generate keywords
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
    'similar colors'
  ].join(', ');
  
  return {
    title: `${fullHex} ${colorName} - Shades, Palettes & Color Details`,
    description: description,
    keywords: keywords,
    
    openGraph: {
      title: `${fullHex} ${colorName} - Shades, Palettes & Color Details`,
      description: `Explore ${fullHex} (${colorName}) with conversions, shades, tints, harmonies, and similar colors.`,
      url: `https://www.whycolors.com/color/${cleanHex}`,
      siteName: 'WhyColors',
      images: [
        {
          url: `https://www.whycolors.com/api/og/color?hex=${cleanHex}`,
          width: 1200,
          height: 630,
          alt: `${colorName} Color ${fullHex}`,
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `${fullHex} ${colorName} - Shades, Palettes & Color Details`,
      description: `Explore ${fullHex} (${colorName}) with conversions, shades, tints, harmonies, and similar colors.`,
      images: [`https://www.whycolors.com/api/og/color?hex=${cleanHex}`],
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
  };
}