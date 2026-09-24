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
      <Link href={`/${locale}/product/${product.id}`} className="block card h-full">
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <motion.img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.7 }}
          />

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {onSale && (
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            >
              -{discountPercent}%
            </motion.span>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg px-4 py-2 bg-red-500 rounded-full">
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
            className="absolute bottom-3 left-3 right-3 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl"
          >
            <ShoppingCart size={18} />
            {t('addToCart')}
          </motion.button>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-navy-700 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-teal-600 transition-colors">
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
              <span className="text-xs text-gray-500">
                ({product.ratingCount || 0})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-teal-600 font-black text-lg">
                {formatPrice(product.price, locale)}
              </span>
              {onSale && (
                <span className="text-gray-400 text-xs line-through">
                  {formatPrice(product.oldPrice!, locale)}
                </span>
              )}
            </div>

            <motion.button
              onClick={handleAdd}
              disabled={product.stock === 0}
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-navy-500 hover:bg-teal-500 text-white p-2.5 rounded-full transition-all disabled:opacity-50 shadow-lg"
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}