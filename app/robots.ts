import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sovereign.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/ar/admin', '/en/admin', '/api/']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}