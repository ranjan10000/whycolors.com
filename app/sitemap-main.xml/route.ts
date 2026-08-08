// app/sitemap-main.xml/route.ts
import { MetadataRoute } from 'next';

const baseUrl = 'https://www.whycolors.com';

export async function GET() {
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/color', priority: 1.0, changefreq: 'weekly' },
    { path: '/color/wheel', priority: 0.9, changefreq: 'weekly' },
    { path: '/color/convert', priority: 0.9, changefreq: 'weekly' },
    { path: '/color/palettes', priority: 0.9, changefreq: 'weekly' },
    { path: '/color/gradient', priority: 0.8, changefreq: 'weekly' },
    { path: '/color/contrast', priority: 0.8, changefreq: 'weekly' },
    { path: '/color/shades', priority: 0.8, changefreq: 'weekly' },
    { path: '/color/finder', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/mixer', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/random', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/picker', priority: 0.8, changefreq: 'weekly' },
    { path: '/color/codes', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/name-finder', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/compare', priority: 0.7, changefreq: 'monthly' },
    { path: '/color/blog', priority: 0.6, changefreq: 'weekly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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