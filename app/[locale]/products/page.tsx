'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
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

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategory(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    getProducts()
      .then((p) => {
        setProducts(p);
        setFiltered(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (category !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    setFiltered(result);
  }, [search, category, products]);

  const categories = [
    'all',
    ...Array.from(new Set(products.map((p) => p.category)))
  ];

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    const qs = params.toString();
    router.push(
      `/${locale}/products${qs ? `?${qs}` : ''}`,
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
      <div
        className="relative min-h-screen overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-secondary-500)' }}
          />
          <div
            className="absolute bottom-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--color-primary-500)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, transparent, var(--color-secondary-500))'
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Stethoscope
                  size={24}
                  style={{ color: 'var(--color-secondary-500)' }}
                />
              </motion.div>
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background:
                    'linear-gradient(to left, transparent, var(--color-secondary-500))'
                }}
              />
            </div>

            <h1
              className="text-3xl md:text-5xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('nav.products')}
            </h1>

            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'اكتشف مجموعتنا من الأدوات الطبية والسكرابات عالية الجودة'
                : 'Discover our collection of premium medical gear'}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mb-10"
          >
            {/* Search */}
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 left-5"
                  size={22}
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'ابحث عن منتج...'
                      : 'Search for a product...'
                  }
                  className="w-full pl-14 pr-14 py-4 rounded-full outline-none transition-all text-lg font-medium"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '2px solid rgba(212, 175, 55, 0.2)',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                  }}
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() => setSearch('')}
                      className="absolute top-1/2 -translate-y-1/2 right-5"
                      style={{ color: 'var(--color-text-muted)' }}
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
              <div
                className="flex items-center gap-2 font-bold flex-shrink-0"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Filter
                  size={18}
                  style={{ color: 'var(--color-secondary-500)' }}
                />
                <span className="hidden md:inline">
                  {locale === 'ar' ? 'التصنيف:' : 'Filter:'}
                </span>
              </div>
              {categories.map((c) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(c)}
                  className="px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all duration-300"
                  style={
                    category.toLowerCase() === c.toLowerCase()
                      ? {
                          background: `linear-gradient(to right, var(--color-secondary-500), var(--color-secondary-600))`,
                          color: '#0a1828',
                          boxShadow: '0 10px 25px -5px var(--color-secondary-500)',
                          border: '2px solid transparent'
                        }
                      : {
                          background: 'var(--color-bg-card)',
                          color: 'var(--color-text-primary)',
                          border: '2px solid rgba(212, 175, 55, 0.2)'
                        }
                  }
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
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {locale === 'ar' ? 'تصفية بـ:' : 'Filtering by:'}
                  </span>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--color-secondary-500)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {category}
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="rounded-full p-0.5 hover:opacity-70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6 font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? `عرض ${filtered.length} من ${products.length} منتج`
                : `Showing ${filtered.length} of ${products.length} products`}
            </motion.p>
          )}

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-80 rounded-2xl"
                  style={{ background: 'var(--color-bg-card)' }}
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
              <div
                className="w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6"
                style={{
                  background: 'var(--color-bg-card)',
                  border: '2px dashed rgba(212, 175, 55, 0.3)'
                }}
              >
                <Package
                  size={60}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {locale === 'ar' ? 'لا توجد نتائج' : 'No results'}
              </h3>
              <p
                className="mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
              >
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
                {filtered.map((p) => (
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
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              border: '4px solid var(--color-secondary-500)',
              borderTopColor: 'transparent'
            }}
          />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}