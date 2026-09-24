'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Stethoscope, Shirt, Syringe, Microscope, Pill, Scissors
} from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const CATEGORIES = [
  {
    key: 'Scrubs',
    icon: Shirt,
    nameAr: 'سكرابات',
    nameEn: 'Scrubs',
    gradient: 'from-teal-400 to-teal-600',
    bg: 'from-teal-50 to-teal-100'
  },
  {
    key: 'Lab Coats',
    icon: Stethoscope,
    nameAr: 'بالطو',
    nameEn: 'Lab Coats',
    gradient: 'from-blue-400 to-blue-600',
    bg: 'from-blue-50 to-blue-100'
  },
  {
    key: 'Equipment',
    icon: Syringe,
    nameAr: 'أدوات طبية',
    nameEn: 'Equipment',
    gradient: 'from-purple-400 to-purple-600',
    bg: 'from-purple-50 to-purple-100'
  },
  {
    key: 'Accessories',
    icon: Microscope,
    nameAr: 'إكسسوارات',
    nameEn: 'Accessories',
    gradient: 'from-orange-400 to-orange-600',
    bg: 'from-orange-50 to-orange-100'
  },
  {
    key: 'Medicines',
    icon: Pill,
    nameAr: 'أدوية',
    nameEn: 'Medicines',
    gradient: 'from-red-400 to-red-600',
    bg: 'from-red-50 to-red-100'
  },
  {
    key: 'Tools',
    icon: Scissors,
    nameAr: 'أدوات جراحة',
    nameEn: 'Surgical Tools',
    gradient: 'from-indigo-400 to-indigo-600',
    bg: 'from-indigo-50 to-indigo-100'
  }
];

export default function CategoriesSection() {
  const locale = useLocale();

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-teal-500 rounded-full" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              <Microscope className="text-teal-500" size={24} />
            </motion.div>
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-teal-500 rounded-full" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-navy-700 mb-3">
            {locale === 'ar' ? 'تصفح حسب التصنيف' : 'Shop by Category'}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.key} variants={staggerItem}>
              <Link
                href={`/${locale}/products?category=${cat.key}`}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={`relative p-6 rounded-3xl bg-gradient-to-br ${cat.bg} border-2 border-transparent hover:border-teal-400 transition-all duration-300 overflow-hidden`}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl transition-shadow`}
                    >
                      <cat.icon size={28} className="text-white" />
                    </motion.div>
                    <p className="font-bold text-navy-700 group-hover:text-white transition-colors text-sm">
                      {locale === 'ar' ? cat.nameAr : cat.nameEn}
                    </p>
                  </div>

                  {/* Decorative circle */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/30 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}