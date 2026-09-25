'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getProducts, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import MedicalBackground from '@/components/MedicalBackground';
import CategoriesSection from '@/components/CategoriesSection';
import StatsSection from '@/components/StatsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import BrandStorySection from '@/components/BrandStorySection';
import {
  Stethoscope, Truck, Headphones, ShieldCheck, ArrowLeft, ArrowRight,
  Heart, Activity, Microscope, Pill, Syringe, Package
} from 'lucide-react';
import {
  fadeInUp, fadeInRight, staggerContainer, staggerItem, heartbeat
} from '@/lib/animations';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    getProducts()
      .then((p) => {
        setProducts(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: Stethoscope,
      title: t('features.quality'),
      desc: t('features.qualityDesc'),
      gradient: 'from-teal-400 to-teal-600'
    },
    {
      icon: Truck,
      title: t('features.shipping'),
      desc: t('features.shippingDesc'),
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      icon: Headphones,
      title: t('features.support'),
      desc: t('features.supportDesc'),
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      icon: ShieldCheck,
      title: t('features.payment'),
      desc: t('features.paymentDesc'),
      gradient: 'from-green-400 to-green-600'
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center px-4 overflow-hidden">
        <MedicalBackground />

        {/* اللوجو الكبير كخلفية */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]"
        >
          <img
            src="/logo.png"
            alt=""
            className="w-[80%] max-w-[900px] h-auto object-contain"
            style={{
              filter: 'brightness(0) invert(1)',
              opacity: 0.08
            }}
          />
        </motion.div>

        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none z-[2]">
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10 py-20"
        >
          {/* Text content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <motion.span
                animate={heartbeat}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: 'var(--color-secondary-500)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Heart
                  size={16}
                  className="fill-current"
                  style={{ color: 'var(--color-secondary-500)' }}
                />
                {t('hero.badge')}
              </motion.span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="gradient-text">{t('hero.title')}</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl mb-8 leading-relaxed max-w-xl"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={`/${locale}/products`} className="btn-primary text-lg">
                  {t('hero.cta')}
                  <Arrow size={20} />
                </Link>
              </motion.div>

              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline text-lg"
              >
                {t('hero.secondary')}
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-6 mt-10 pt-8 flex-wrap"
              style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)' }}
            >
              <div>
                <p
                  className="text-3xl font-black"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  5000+
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {locale === 'ar' ? 'طالب طب' : 'Students'}
                </p>
              </div>
              <div
                className="w-px h-12"
                style={{ background: 'rgba(212, 175, 55, 0.2)' }}
              />
              <div>
                <p
                  className="text-3xl font-black"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  4.9
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {locale === 'ar' ? 'تقييم' : 'Rating'}
                </p>
              </div>
              <div
                className="w-px h-12"
                style={{ background: 'rgba(212, 175, 55, 0.2)' }}
              />
              <div>
                <p
                  className="text-3xl font-black"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  24/7
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {locale === 'ar' ? 'دعم' : 'Support'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* اللوجو الكبير على اليمين */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInRight}
            className="hidden md:flex justify-center items-center relative"
          >
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              {/* Rotating rings */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  border: '4px solid rgba(212, 175, 55, 0.3)',
                  width: '520px',
                  height: '520px'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              >
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-lg"
                  style={{ background: 'var(--color-secondary-500)' }}
                />
              </motion.div>

              <motion.div
                className="absolute rounded-full"
                style={{
                  border: '4px dashed rgba(212, 175, 55, 0.15)',
                  width: '460px',
                  height: '460px'
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              />

              {/* Glow */}
              <motion.div
                className="absolute rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, var(--color-secondary-500) 0%, transparent 70%)`,
                  width: '400px',
                  height: '400px',
                  opacity: 0.15
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* اللوجو الرئيسي */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <img
                  src="/logo.png"
                  alt="Sovereign"
                  className="w-[320px] h-auto object-contain drop-shadow-2xl"
                  style={{
                    filter:
                      'brightness(0) invert(1) drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))'
                  }}
                />
              </motion.div>

              {/* Floating medical icons */}
              {[
                {
                  icon: Heart,
                  delay: 0,
                  position: 'top-0 right-0',
                  color: '#ef4444'
                },
                {
                  icon: Activity,
                  delay: 1,
                  position: 'bottom-0 left-0',
                  color: '#3b82f6'
                },
                {
                  icon: Microscope,
                  delay: 2,
                  position: 'top-1/3 -left-12',
                  color: '#8b5cf6'
                },
                {
                  icon: Pill,
                  delay: 1.5,
                  position: 'bottom-1/4 -right-8',
                  color: '#10b981'
                },
                {
                  icon: Syringe,
                  delay: 0.7,
                  position: 'top-1/4 -right-12',
                  color: '#ec4899'
                }
              ].map(({ icon: Icon, delay, position, color }, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${position} w-14 h-14 rounded-full flex items-center justify-center shadow-xl`}
                  style={{
                    background: 'rgba(26, 47, 77, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay
                  }}
                >
                  <Icon size={24} style={{ color }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center p-2"
            style={{ border: '2px solid rgba(212, 175, 55, 0.4)' }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-secondary-500)' }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ============ FEATURES ============ */}
      <section
        id="features"
        className="relative py-24 px-4 overflow-hidden"
        style={{ background: 'var(--color-bg-surface)' }}
      >
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, transparent, var(--color-secondary-500))'
                }}
              />
              <Heart
                size={20}
                className="fill-current"
                style={{ color: 'var(--color-secondary-500)' }}
              />
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to left, transparent, var(--color-secondary-500))'
                }}
              />
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'ليه Sovereign؟' : 'Why Sovereign?'}
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'مميزات حقيقية تخليك تختارنا عن غيرنا'
                : 'Real features that make us your top choice'}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -12, scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="group relative p-8 rounded-3xl transition-all duration-500 overflow-hidden"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px solid rgba(212, 175, 55, 0.15)'
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
                />

                <motion.div
                  className={`relative w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <f.icon size={32} className="text-white" />
                </motion.div>

                <h3
                  className="relative font-bold mb-2 text-center text-lg z-10"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {f.title}
                </h3>

                <p
                  className="relative text-sm text-center z-10"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <CategoriesSection />

      {/* ============ FEATURED PRODUCTS ============ */}
      <section
        className="relative py-24 px-4 overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, transparent, var(--color-secondary-500))'
                }}
              />
              <Activity size={20} style={{ color: 'var(--color-secondary-500)' }} />
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to left, transparent, var(--color-secondary-500))'
                }}
              />
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('sections.featured')}
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('sections.featuredDesc')}
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-80 rounded-2xl"
                  style={{ background: 'var(--color-bg-card)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Package
                size={80}
                className="mx-auto mb-4"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                {locale === 'ar' ? 'لا توجد منتجات بعد' : 'No products yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {products.slice(0, 8).map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={`/${locale}/products`} className="btn-outline text-lg">
                  {t('sections.allProducts')}
                  <Arrow size={20} />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ STATS ============ */}
      <StatsSection />

      {/* ============ BRAND STORY ============ */}
      <BrandStorySection />

      {/* ============ TESTIMONIALS ============ */}
      <TestimonialsSection />

      {/* ============ FAQ ============ */}
      <FAQSection />

      {/* ============ CTA ============ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600), var(--color-primary-700))`
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-6"
          >
            <motion.div
              animate={heartbeat}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Heart size={40} className="text-white fill-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            {locale === 'ar'
              ? 'ابدأ رحلتك الطبية معنا'
              : 'Start Your Medical Journey'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/90 text-lg mb-10 max-w-2xl mx-auto"
          >
            {locale === 'ar'
              ? 'جودة عالية، شحن سريع، وأسعار تناسب طلاب الطب'
              : 'Premium quality, fast shipping, prices that fit medical students'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              href={`/${locale}/products`}
              className="px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
              style={{
                background: '#ffffff',
                color: 'var(--color-primary-700)'
              }}
            >
              {t('hero.cta')}
              <Arrow size={22} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}