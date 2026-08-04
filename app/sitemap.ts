import { MetadataRoute } from 'next';
import { getAllColors } from '@/lib/color-generator';

const baseUrl = 'https://www.whycolors.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Get all 7,800 colors
  const allColors = getAllColors();
  
  // Static tool pages (15)
  const staticPages = [
    '/color',
    '/color/wheel',
    '/color/convert',
    '/color/palette',
    '/color/gradient',
    '/color/contrast',
    '/color/shades',
    '/color/finder',
    '/color/mixer',
    '/color/random',
    '/color/picker',
    '/color/codes',
    '/color/name-finder',
    '/color/compare',
    '/color/blog',
  ];

  // Conversion pages (20)
  const formats = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk'];
  const conversionPages: string[] = [];
  for (const from of formats) {
    for (const to of formats) {
      if (from !== to) {
        conversionPages.push(`/color/convert/${from}-to-${to}`);
      }
    }
  }

  // Palette categories (25)
  const paletteCategories = [
    'popular', 'trending', 'blue', 'green', 'pink', 'purple',
    'orange', 'red', 'yellow', 'neon', 'pastel', 'dark',
    'light', 'nature', 'ocean', 'sunset', 'forest', 'retro',
    'vintage', 'minimal', 'monochrome', 'complementary',
    'triadic', 'tetradic', 'analogous'
  ];
  
  const palettePages = paletteCategories.map(
    cat => `/color/palettes/${cat}`
  );

  // Color pages (7,800)
  const colorPages = allColors.map(hex => `/color/${hex.toLowerCase()}`);

  // Combine all URLs
  const allUrls = [
    ...staticPages,
    ...conversionPages,
    ...palettePages,
    ...colorPages,
  ];

  // Generate sitemap entries
  return allUrls.map(url => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: url.includes('/color/') && !url.includes('/convert/')
      ? 'weekly' 
      : 'monthly',
    priority: url === '/color' ? 1.0 : 
             url.includes('/color/convert/') ? 0.9 :
             url.includes('/color/') ? 0.7 : 0.8,
  }));
}