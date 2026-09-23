'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getProducts, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import { Stethoscope, Truck, Headphones, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(p => {
      setProducts(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const features = [
    { icon: Stethoscope, title: t('features.quality'), desc: t('features.qualityDesc'), color: 'bg-teal-100 text-teal-600' },
    { icon: Truck, title: t('features.shipping'), desc: t('features.shippingDesc'), color: 'bg-blue-100 text-blue-600' },
    { icon: Headphones, title: t('features.support'), desc: t('features.supportDesc'), color: 'bg-purple-100 text-purple-600' },
    { icon: ShieldCheck, title: t('features.payment'), desc: t('features.paymentDesc'), color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-navy-500 via-navy-700 to-navy-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-teal-400 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-block bg-teal-500/20 border border-teal-400 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`} className="btn-primary text-lg">
                {t('hero.cta')}
                <Arrow size={20} />
              </Link>
              <a href="#features" className="border-2 border-white text-white hover:bg-white hover:text-navy-500 px-6 py-3 rounded-lg font-semibold transition-all">
                {t('hero.secondary')}
              </a>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-teal-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-teal-400/30">
                <Stethoscope size={200} className="text-teal-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={28} />
              </div>
              <h3 className="font-bold text-navy-700 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-navy-700 mb-3">
              {t('sections.featured')}
            </h2>
            <p className="text-gray-600">{t('sections.featuredDesc')}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse h-80 bg-gray-200"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">لا توجد منتجات بعد — قم بإضافة منتجات من لوحة التحكم</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link href={`/${locale}/products`} className="btn-outline">
                {t('sections.allProducts')}
                <Arrow size={20} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}