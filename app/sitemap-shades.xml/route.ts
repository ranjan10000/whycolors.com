// app/sitemap-shades.xml/route.ts
import {getShadePageColors } from '@/lib/color-cache.server';

const baseUrl = 'https://www.whycolors.com';

export async function GET() {
  try {
    // ✅ 5,000 colors for shades sitemap
    const colors = getShadePageColors();
    
    console.log(`📦 Generating shades sitemap with ${colors.length} entries`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${colors.map(hex => `
  <url>
    <loc>${baseUrl}/shades/${hex.toLowerCase()}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating shades sitemap:', error);
    // Return fallback sitemap on error
    const fallbackColors = [
      'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
      '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6'
    ];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${fallbackColors.map(hex => `
  <url>
    <loc>${baseUrl}/shades/${hex.toLowerCase()}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}