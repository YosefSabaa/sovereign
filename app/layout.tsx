import './globals.css';
import { ReactNode } from 'react';
import Analytics from '@/components/Analytics';
import ErrorBoundary from '@/components/ErrorBoundary';
import HydrationFix from '@/components/HydrationFix';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://sovereign.vercel.app';

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sovereign | متجر الأدوات الطبية لطلاب الطب',
    template: '%s | Sovereign'
  },
  description:
    'متجرك الأول للسكرابات والأدوات الطبية عالية الجودة في مصر. شحن سريع، أسعار مناسبة، وجودة مضمونة.',
  keywords: [
    'سكرابات طبية',
    'أدوات طبية',
    'مستلزمات طلاب الطب',
    'Medical scrubs',
    'Medical equipment',
    'Egypt',
    'Sovereign'
  ],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: baseUrl,
    siteName: 'Sovereign',
    title: 'Sovereign | متجر الأدوات الطبية لطلاب الطب',
    description: 'متجرك الأول للسكرابات والأدوات الطبية عالية الجودة في مصر',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sovereign Medical Store'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sovereign | متجر الأدوات الطبية',
    description: 'سكرابات وأدوات طبية لطلاب الطب في مصر',
    images: ['/og-image.jpg']
  },
  icons: {
    icon: [
     { url: '/favicon.ico', sizes: 'any' }
    ]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      translate="no"
      className="notranslate"
    >
      <body suppressHydrationWarning className="notranslate">
        <HydrationFix />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}