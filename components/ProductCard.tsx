'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useCart } from './CartProvider';
import { Product } from '@/lib/firestore';
import toast from 'react-hot-toast';
import { ShoppingCart, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations('product');
  const { add } = useCart();

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const onSale = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = onSale
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({
      productId: product.id!,
      name,
      price: product.price,
      image: product.image,
      qty: 1
    });
    toast.success(locale === 'ar' ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <Link href={`/${locale}/product/${product.id}`} className="block h-full">
        <div
          className="rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid rgba(212, 175, 55, 0.15)'
          }}
        >
          <div className="relative h-64 overflow-hidden bg-gray-100">
            <motion.img
              src={product.image}
              alt={name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.7 }}
            />

            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />

            {onSale && (
              <motion.span
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                style={{ background: 'linear-gradient(to right, #ef4444, #dc2626)', color: '#fff' }}
              >
                -{discountPercent}%
              </motion.span>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <span
                  className="px-4 py-2 rounded-full font-bold"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  {t('outOfStock')}
                </span>
              </div>
            )}

            <motion.button
              onClick={handleAdd}
              disabled={product.stock === 0}
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-3 left-3 right-3 py-3 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl"
              style={{ background: 'var(--color-secondary-500)', color: '#0a1828' }}
            >
              <ShoppingCart size={18} />
              {t('addToCart')}
            </motion.button>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h3
              className="font-bold mb-2 line-clamp-2 min-h-[3rem]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {name}
            </h3>

            {product.rating && product.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ({product.ratingCount || 0})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span
                  className="font-black text-lg"
                  style={{ color: 'var(--color-secondary-500)' }}
                >
                  {formatPrice(product.price, locale)}
                </span>
                {onSale && (
                  <span
                    className="text-xs line-through"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {formatPrice(product.oldPrice!, locale)}
                  </span>
                )}
              </div>

              <motion.button
                onClick={handleAdd}
                disabled={product.stock === 0}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full transition-all disabled:opacity-50 shadow-lg"
                style={{
                  background: 'var(--color-primary-500)',
                  color: 'var(--color-secondary-500)'
                }}
              >
                <ShoppingCart size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}