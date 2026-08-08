// app/sitemap-colors.xml/route.ts
import { getColorPageColors } from '@/lib/color-cache.server';

const baseUrl = 'https://www.whycolors.com';

export async function GET() {
  try {
    // Get 7,500 colors for sitemap
    const colors = getColorPageColors();
    
    console.log(`📦 Generating color sitemap with ${colors.length} entries`);

    // Split into chunks for better performance
    const chunkSize = 5000;
    const chunks = [];
    for (let i = 0; i < colors.length; i += chunkSize) {
      chunks.push(colors.slice(i, i + chunkSize));
    }

    // Create sitemap with all colors
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${colors.map(hex => `
  <url>
    <loc>${baseUrl}/color/${hex.toLowerCase()}</loc>
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
    console.error('Error generating color sitemap:', error);
    // Return empty sitemap on error
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/color</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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