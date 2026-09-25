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
  description: 'متجرك الأول للسكرابات والأدوات الطبية عالية الجودة في مصر',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <HydrationFix />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}