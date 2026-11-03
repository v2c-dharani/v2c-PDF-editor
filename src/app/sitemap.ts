import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/lib/tools-data';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://v2c-pdf.app');

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  ALL_TOOLS.forEach((tool) => {
    routes.push({
      url: `${siteUrl}/tools/${tool.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return routes;
}
