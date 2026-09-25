'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
  getRelatedProducts,
  getProducts,
  Product
} from '@/lib/firestore';
import ProductCard from './ProductCard';
import { Sparkles, Package } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

type Props = {
  category: string;
  excludeId: string;
};

export default function RelatedProducts({ category, excludeId }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // جرب منتجات نفس الفئة أولاً
        let related = await getRelatedProducts(category, excludeId, 4);

        // لو أقل من 4، جيب منتجات عشوائية
        if (related.length < 4) {
          const all = await getProducts();
          const extra = all
            .filter((p) => p.id !== excludeId && !related.find((r) => r.id === p.id))
            .slice(0, 4 - related.length);
          related = [...related, ...extra];
        }

        setProducts(related);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [category, excludeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-2xl animate-pulse"
            style={{ background: 'var(--color-bg-card)' }}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
      className="py-12"
      style={{ borderTop: '1px solid rgba(212, 175, 55, 0.15)' }}
    >
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3 mb-8"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: `linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))`
          }}
        >
          <Sparkles size={24} style={{ color: '#0a1828' }} />
        </div>
        <div>
          <h2
            className="text-2xl md:text-3xl font-black"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {locale === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {locale === 'ar'
              ? 'قد تعجبك أيضاً'
              : 'You might also like'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <motion.div key={p.id} variants={staggerItem}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}