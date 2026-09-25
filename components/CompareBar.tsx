'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useCompare } from './CompareProvider';
import { getProduct, Product } from '@/lib/firestore';
import { X, GitCompare, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CompareBar() {
  const locale = useLocale();
  const { items, toggle, clear } = useCompare();
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || items.length === 0) {
      setProducts([]);
      return;
    }

    Promise.all(items.map((id) => getProduct(id))).then((results) => {
      setProducts(results.filter((p): p is Product => p !== null));
    });
  }, [items, mounted]);

  if (!mounted || items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'var(--color-primary-900)',
          borderTop: '2px solid var(--color-secondary-500)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
              }}
            >
              <GitCompare size={20} style={{ color: '#0a1828' }} />
            </div>
            <div>
              <p
                className="font-bold text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {locale === 'ar'
                  ? `مقارنة (${items.length}/3)`
                  : `Compare (${items.length}/3)`}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {locale === 'ar'
                  ? 'ضيف لحد 3 منتجات'
                  : 'Add up to 3 products'}
              </p>
            </div>
          </div>

          {/* Product thumbnails */}
          <div className="flex gap-2 flex-1">
            {products.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: '2px solid rgba(212, 175, 55, 0.3)' }}
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggle(p.id!)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </motion.div>
            ))}
            {[...Array(3 - products.length)].map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  border: '2px dashed rgba(212, 175, 55, 0.2)',
                  color: 'var(--color-text-muted)'
                }}
              >
                +
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={clear}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:opacity-80"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {locale === 'ar' ? 'مسح' : 'Clear'}
            </button>

            {products.length >= 2 && (
              <Link
                href={`/${locale}/compare`}
                className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
              >
                {locale === 'ar' ? 'قارن الآن' : 'Compare Now'}
                <Arrow size={16} />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}