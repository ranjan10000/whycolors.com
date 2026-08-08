// app/sitemap-palettes.xml/route.ts
import { getPalettePageColors } from '@/lib/color-cache.server';

const baseUrl = 'https://www.whycolors.com';

export async function GET() {
  try {
    // Get 7,500 colors for palette sitemap
    const colors = getPalettePageColors();
    
    console.log(`📦 Generating palette sitemap with ${colors.length} entries`);

    // Generate sitemap with all palette pages
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${colors.map(hex => `
  <url>
    <loc>${baseUrl}/color/palettes/${hex.toLowerCase()}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('Error generating palette sitemap:', error);
    // Return empty sitemap on error
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/color/palettes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}