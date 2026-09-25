'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useCompare } from '@/components/CompareProvider';
import { getProduct, Product } from '@/lib/firestore';
import PageTransition from '@/components/PageTransition';
import { formatPrice } from '@/lib/utils';
import {
  X, GitCompare, Check, Minus, ShoppingCart, Star, Package
} from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const locale = useLocale();
  const t = useTranslations();
  const { items, toggle, clear } = useCompare();
  const { add } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    Promise.all(items.map((id) => getProduct(id)))
      .then((results) => {
        setProducts(results.filter((p): p is Product => p !== null));
      })
      .finally(() => setLoading(false));
  }, [items]);

  const handleAddToCart = (product: Product) => {
    const name = locale === 'ar' ? product.nameAr : product.nameEn;
    add({
      productId: product.id!,
      name,
      price: product.price,
      image: product.image,
      qty: 1
    });
    toast.success(locale === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
  };

  if (loading) {
    return (
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="h-96 rounded-3xl animate-pulse"
            style={{ background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length < 2) {
    return (
      <PageTransition>
        <div
          className="min-h-[80vh] flex items-center justify-center px-4"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="max-w-md text-center">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background: `linear-gradient(to bottom right, rgba(212, 175, 55, 0.15), rgba(30, 58, 95, 0.4))`,
                border: '2px solid rgba(212, 175, 55, 0.4)'
              }}
            >
              <GitCompare
                size={48}
                style={{ color: 'var(--color-secondary-500)' }}
              />
            </div>

            <h1
              className="text-2xl font-black mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {locale === 'ar'
                ? 'محتاج منتجين على الأقل للمقارنة'
                : 'Need at least 2 products'}
            </h1>
            <p
              className="mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {locale === 'ar'
                ? 'أضف منتجات للمقارنة من صفحة المنتجات'
                : 'Add products to compare from the products page'}
            </p>
            <Link
              href={`/${locale}/products`}
              className="btn-primary inline-flex"
            >
              <Package size={20} />
              {t('nav.products')}
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Comparison table
  const features = [
    { key: 'price', ar: 'السعر', en: 'Price' },
    { key: 'rating', ar: 'التقييم', en: 'Rating' },
    { key: 'category', ar: 'التصنيف', en: 'Category' },
    { key: 'stock', ar: 'المخزون', en: 'Stock' },
    { key: 'description', ar: 'الوصف', en: 'Description' }
  ];

  return (
    <PageTransition>
      <div
        className="min-h-screen py-10 px-4"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
                }}
              >
                <GitCompare size={26} style={{ color: '#0a1828' }} />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-black"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {locale === 'ar' ? 'مقارنة المنتجات' : 'Compare Products'}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {products.length}{' '}
                  {locale === 'ar' ? 'منتج' : 'products'}
                </p>
              </div>
            </div>

            <button
              onClick={clear}
              className="px-5 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all hover:opacity-80"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <X size={18} />
              {locale === 'ar' ? 'مسح الكل' : 'Clear all'}
            </button>
          </motion.div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th
                    className="p-4 text-start"
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      width: '180px'
                    }}
                  >
                    {locale === 'ar' ? 'الميزة' : 'Feature'}
                  </th>
                  {products.map((p) => {
                    const name = locale === 'ar' ? p.nameAr : p.nameEn;
                    return (
                      <th key={p.id} className="p-4">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative rounded-2xl p-4"
                          style={{
                            background: 'var(--color-bg-card)',
                            border: '2px solid rgba(212, 175, 55, 0.3)'
                          }}
                        >
                          <button
                            onClick={() => toggle(p.id!)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{
                              background: '#ef4444',
                              color: '#fff'
                            }}
                          >
                            <X size={14} strokeWidth={3} />
                          </button>

                          <Link
                            href={`/${locale}/product/${p.id}`}
                            className="block"
                          >
                            <img
                              src={p.image}
                              alt={name}
                              className="w-32 h-32 mx-auto rounded-xl object-cover mb-3"
                            />
                            <p
                              className="font-bold line-clamp-2 text-sm min-h-[2.5rem]"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {name}
                            </p>
                          </Link>
                        </motion.div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {features.map((feature, idx) => (
                  <motion.tr
                    key={feature.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                    }}
                  >
                    <td
                      className="p-4 font-bold"
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem'
                      }}
                    >
                      {locale === 'ar' ? feature.ar : feature.en}
                    </td>

                    {products.map((p) => {
                      let content: any = null;

                      switch (feature.key) {
                        case 'price':
                          content = (
                            <div>
                              <span
                                className="font-black text-lg"
                                style={{
                                  color: 'var(--color-secondary-500)'
                                }}
                              >
                                {formatPrice(p.price, locale)}
                              </span>
                              {p.oldPrice && p.oldPrice > p.price && (
                                <span
                                  className="text-xs line-through block"
                                  style={{
                                    color: 'var(--color-text-muted)'
                                  }}
                                >
                                  {formatPrice(p.oldPrice, locale)}
                                </span>
                              )}
                            </div>
                          );
                          break;

                        case 'rating':
                          content = (
                            <div className="flex items-center gap-2 justify-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={
                                      i < Math.round(p.rating || 0)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-500'
                                    }
                                  />
                                ))}
                              </div>
                              <span
                                className="text-sm font-bold"
                                style={{
                                  color: 'var(--color-text-primary)'
                                }}
                              >
                                {(p.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          );
                          break;

                        case 'category':
                          content = (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold inline-block"
                              style={{
                                background: 'rgba(212, 175, 55, 0.15)',
                                color: 'var(--color-secondary-500)',
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              }}
                            >
                              {p.category}
                            </span>
                          );
                          break;

                        case 'stock':
                          content = p.stock > 0 ? (
                            <div className="flex items-center gap-2 justify-center">
                              <Check
                                size={18}
                                style={{ color: '#10b981' }}
                              />
                              <span
                                className="font-bold"
                                style={{ color: '#10b981' }}
                              >
                                {p.stock}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-center">
                              <Minus size={18} style={{ color: '#ef4444' }} />
                              <span
                                className="font-bold"
                                style={{ color: '#ef4444' }}
                              >
                                {locale === 'ar' ? 'نفذ' : 'Out'}
                              </span>
                            </div>
                          );
                          break;

                        case 'description':
                          content = (
                            <p
                              className="text-sm text-center line-clamp-3"
                              style={{
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {locale === 'ar' ? p.descAr : p.descEn}
                            </p>
                          );
                          break;
                      }

                      return (
                        <td key={p.id} className="p-4 text-center">
                          {content}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}

                {/* Add to cart row */}
                <tr
                  style={{
                    borderTop: '1px solid rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <td className="p-4"></td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={p.stock === 0}
                        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        <ShoppingCart size={18} />
                        {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}