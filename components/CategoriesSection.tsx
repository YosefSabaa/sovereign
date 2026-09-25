'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Stethoscope, Shirt, Syringe, Microscope, Pill, Scissors
} from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const CATEGORIES = [
  { key: 'Scrubs', icon: Shirt, nameAr: 'سكرابات', nameEn: 'Scrubs', gradient: 'from-yellow-400 to-yellow-600' },
  { key: 'Lab Coats', icon: Stethoscope, nameAr: 'بالطو', nameEn: 'Lab Coats', gradient: 'from-blue-400 to-blue-600' },
  { key: 'Equipment', icon: Syringe, nameAr: 'أدوات طبية', nameEn: 'Equipment', gradient: 'from-purple-400 to-purple-600' },
  { key: 'Accessories', icon: Microscope, nameAr: 'إكسسوارات', nameEn: 'Accessories', gradient: 'from-orange-400 to-orange-600' },
  { key: 'Medicines', icon: Pill, nameAr: 'أدوية', nameEn: 'Medicines', gradient: 'from-red-400 to-red-600' },
  { key: 'Tools', icon: Scissors, nameAr: 'أدوات جراحة', nameEn: 'Surgical Tools', gradient: 'from-indigo-400 to-indigo-600' }
];

export default function CategoriesSection() {
  const locale = useLocale();

  return (
    <section
      className="py-20 px-4 relative overflow-hidden"
      style={{ background: 'var(--color-bg-surface)' }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="h-1 w-12 rounded-full"
              style={{ background: 'linear-gradient(to right, transparent, var(--color-secondary-500))' }}
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Microscope size={24} style={{ color: 'var(--color-secondary-500)' }} />
            </motion.div>
            <div
              className="h-1 w-12 rounded-full"
              style={{ background: 'linear-gradient(to left, transparent, var(--color-secondary-500))' }}
            />
          </div>

          <h2
            className="text-3xl md:text-5xl font-black mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'تصفح حسب التصنيف' : 'Shop by Category'}
          </h2>

          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {locale === 'ar'
              ? 'اختر من مجموعة واسعة من المنتجات الطبية المصنفة بعناية'
              : 'Choose from a wide range of carefully categorized medical products'}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.key} variants={staggerItem}>
              <Link
                href={`/${locale}/products?category=${encodeURIComponent(cat.key)}`}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="relative p-6 rounded-3xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '2px solid rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-shadow`}
                    >
                      <cat.icon size={28} style={{ color: '#ffffff' }} />
                    </motion.div>

                    <p
                      className="font-bold text-sm transition-colors duration-300 group-hover:!text-white"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {locale === 'ar' ? cat.nameAr : cat.nameEn}
                    </p>
                  </div>

                  <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}