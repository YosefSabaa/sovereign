'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import MedicalSectionTitle from '@/components/MedicalSectionTitle';
import { Search, Stethoscope, X, Filter, Package } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

function ProductsContent() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // 🎯 اقرأ الـ category من الـ URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setCategory(urlCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    getProducts()
      .then(p => {
        setProducts(p);
        setFiltered(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 🎯 فلترة محسّنة
  useEffect(() => {
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        p =>
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'all') {
      result = result.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    setFiltered(result);
  }, [search, category, products]);

  const categories = [
    'all',
    ...Array.from(new Set(products.map(p => p.category)))
  ];

  // 🎯 لما المستخدم يضغط على تصنيف، حدّث الـ URL
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);

    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }

    const queryString = params.toString();
    router.push(
      `/${locale}/products${queryString ? `?${queryString}` : ''}`,
      { scroll: false }
    );
  };

  const clearAll = () => {
    setSearch('');
    setCategory('all');
    router.push(`/${locale}/products`, { scroll: false });
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-navy-200/20 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #1e3a5f 1px, transparent 1px),
                linear-gradient(to bottom, #1e3a5f 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          {/* Header */}
          <MedicalSectionTitle
            title={t('nav.products')}
            subtitle={
              locale === 'ar'
                ? 'اكتشف مجموعتنا من الأدوات الطبية والسكرابات عالية الجودة'
                : 'Discover our collection of premium medical gear'
            }
            icon={Stethoscope}
          />

          {/* Filters */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-10"
          >
            {/* Search bar */}
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 left-5 text-gray-400"
                  size={22}
                />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'ابحث عن منتج...'
                      : 'Search for a product...'
                  }
                  className="w-full pl-14 pr-14 py-4 rounded-full border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 outline-none transition-all bg-white shadow-lg text-lg font-medium"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 -translate-y-1/2 right-5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={22} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Category filter */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
            >
              <div className="flex items-center gap-2 text-navy-700 font-bold flex-shrink-0">
                <Filter size={18} />
                <span className="hidden md:inline">
                  {locale === 'ar' ? 'التصنيف:' : 'Filter:'}
                </span>
              </div>
              {categories.map(c => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300 ${
                    category.toLowerCase() === c.toLowerCase()
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-white text-navy-700 border-2 border-gray-200 hover:border-teal-500'
                  }`}
                >
                  {c === 'all'
                    ? locale === 'ar'
                      ? 'الكل'
                      : 'All'
                    : c}
                </motion.button>
              ))}
            </motion.div>

            {/* Active filter chip */}
            <AnimatePresence>
              {category !== 'all' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2"
                >
                  <span className="text-sm text-gray-500">
                    {locale === 'ar' ? 'تصفية بـ:' : 'Filtering by:'}
                  </span>
                  <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full text-sm font-bold border border-teal-200">
                    {category}
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mb-6 font-medium"
            >
              {locale === 'ar'
                ? `عرض ${filtered.length} من ${products.length} منتج`
                : `Showing ${filtered.length} of ${products.length} products`}
            </motion.p>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                <Package size={60} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-navy-700 mb-2">
                {locale === 'ar' ? 'لا توجد نتائج' : 'No results'}
              </h3>
              <p className="text-gray-500 mb-6">
                {locale === 'ar'
                  ? 'جرّب البحث بكلمات تانية'
                  : 'Try searching with different keywords'}
              </p>
              <button onClick={clearAll} className="btn-primary">
                {locale === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    variants={staggerItem}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}