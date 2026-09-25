import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sovereign.vercel.app';

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/ar`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/ar/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/en/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/ar/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/ar/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/en/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 }
  ];

  try {
    const snap = await getDocs(collection(db, 'products'));
    const productPages: MetadataRoute.Sitemap = [];

    snap.docs.forEach((d) => {
      const data = d.data();
      const lastMod = data.createdAt?.toDate?.() || new Date();
      productPages.push(
        {
          url: `${baseUrl}/ar/product/${d.id}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8
        },
        {
          url: `${baseUrl}/en/product/${d.id}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.8
        }
      );
    });

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}