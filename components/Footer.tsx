'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="bg-navy-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-navy-500 font-black text-lg">
              S
            </div>
            <h3 className="font-bold text-xl">Sovereign</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{t('aboutText')}</p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-teal-400 transition-colors p-2 bg-navy-700 rounded-full">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-teal-400 transition-colors p-2 bg-navy-700 rounded-full">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-teal-400">{t('links')}</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href={`/${locale}`} className="hover:text-white">{tn('home')}</Link></li>
            <li><Link href={`/${locale}/products`} className="hover:text-white">{tn('products')}</Link></li>
            <li><Link href={`/${locale}/orders`} className="hover:text-white">{tn('orders')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-teal-400">{t('contact')}</h4>
          <div className="space-y-3 text-sm text-gray-300">
            <p className="flex items-center gap-2"><Phone size={16} /> +20 101 234 5678</p>
            <p className="flex items-center gap-2"><Mail size={16} /> info@sovereign.com</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> Cairo, Egypt</p>
          </div>
        </div>
      </div>
      <div className="border-t border-navy-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Sovereign. {t('rights')}.
      </div>
    </footer>
  );
}