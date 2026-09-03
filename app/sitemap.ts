// app/sitemap.ts
import { MetadataRoute } from 'next';

const baseUrl = 'https://www.whycolors.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // All sitemap indices
  const sitemaps = [
    {
      url: `${baseUrl}/sitemap-main.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-colors.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-palettes.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-conversions.xml`,
      lastModified: new Date(),
    },
     {
      url: `${baseUrl}/sitemap-shades.xml`,
      lastModified: new Date(),
    },
  ];

  return sitemaps;
}