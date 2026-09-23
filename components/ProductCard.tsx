'use client';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
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
    <Link href={`/${locale}/product/${product.id}`} className="card group block">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {onSale && (
          <span className="absolute top-3 right-3 bg-red-500 text-white badge">
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-navy-700 mb-2 line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        {product.rating && product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {product.rating.toFixed(1)} ({product.ratingCount || 0})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-teal-600 font-bold text-lg">
              {formatPrice(product.price, locale)}
            </span>
            {onSale && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(product.oldPrice!, locale)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="bg-navy-500 hover:bg-teal-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}