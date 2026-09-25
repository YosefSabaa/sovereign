'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/components/WishlistProvider';
import { getProduct, Product } from '@/lib/firestore';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import { Heart, ShoppingBag } from 'lucide-react';
import { staggerContainer, staggerItem, heartbeat } from '@/lib/animations';

export default function WishlistPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items: wishlistIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistLoading) return;

    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    Promise.all(wishlistIds.map((id) => getProduct(id)))
      .then((results) => {
        setProducts(results.filter((p): p is Product => p !== null));
      })
      .finally(() => setLoading(false));
  }, [wishlistIds, wishlistLoading]);

  if (loading || wishlistLoading) {
    return (
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl animate-pulse"
              style={{ background: 'var(--color-bg-card)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <PageTransition>
        <div
          className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: '#ef4444' }}
            />
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-md text-center relative z-10"
          >
            <motion.div
              variants={staggerItem}
              className="relative w-40 h-40 mx-auto mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '4px dashed rgba(212, 175, 55, 0.4)' }}
              />
              <motion.div
                animate={heartbeat}
                className="absolute inset-6 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, rgba(239, 68, 68, 0.15), rgba(212, 175, 55, 0.2))`,
                  border: '2px solid rgba(212, 175, 55, 0.4)'
                }}
              >
                <Heart
                  size={60}
                  className="fill-current"
                  style={{ color: 'var(--color-secondary-500)' }}
                />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-3xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'المفضلة فارغة' : 'Wishlist is empty'}
            </motion.h1>

            <motion.p
              variants={staggerItem}
              className="mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'احفظ منتجاتك المفضلة للرجوع إليها لاحقاً'
                : 'Save your favorite products for later'}
            </motion.p>

            <motion.div variants={staggerItem}>
              <Link
                href={`/${locale}/products`}
                className="btn-primary inline-flex text-lg px-8 py-4"
              >
                <ShoppingBag size={20} />
                {t('cart.continue')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4 relative overflow-hidden"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background: 'linear-gradient(to right, transparent, #ef4444)'
                }}
              />
              <motion.div animate={heartbeat}>
                <Heart
                  size={24}
                  className="fill-current"
                  style={{ color: '#ef4444' }}
                />
              </motion.div>
              <div
                className="h-1 w-12 rounded-full"
                style={{
                  background: 'linear-gradient(to left, transparent, #ef4444)'
                }}
              />
            </div>

            <h1
              className="text-3xl md:text-5xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar' ? 'المفضلة' : 'Wishlist'}
            </h1>

            <p
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? `${products.length} منتج محفوظ`
                : `${products.length} saved products`}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {products.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  variants={staggerItem}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}