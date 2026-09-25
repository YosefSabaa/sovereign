import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WishlistProvider } from '@/components/WishlistProvider';
import { CompareProvider } from '@/components/CompareProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import MedicalLoader from '@/components/MedicalLoader';
import CompareBar from '@/components/CompareBar';
import { Toaster } from 'react-hot-toast';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!['ar', 'en'].includes(locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                <MedicalLoader />
                <Navbar />
                <main className="flex-1 pb-24">{children}</main>
                <Footer />
                <WhatsAppButton />
                <CompareBar />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1a2f4d',
                      color: '#f8fafc',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
                    },
                    success: {
                      iconTheme: { primary: '#d4af37', secondary: '#1a2f4d' }
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#fff' }
                    }
                  }}
                />
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}