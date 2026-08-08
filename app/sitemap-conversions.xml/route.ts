// app/sitemap-conversions.xml/route.ts
import { MetadataRoute } from 'next';

const baseUrl = 'https://www.whycolors.com';

export async function GET() {
  const formats = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk'];
  const conversionPages: string[] = [];
  
  for (const from of formats) {
    for (const to of formats) {
      if (from !== to) {
        conversionPages.push(`/color/convert/${from}-to-${to}`);
      }
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${conversionPages.map(path => `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
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